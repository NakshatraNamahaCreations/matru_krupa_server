const Product = require("../models/Product");
const Category = require("../models/Category");
const Order = require("../models/Order");
const User = require("../models/User");
const Staff = require("../models/Staff");

// GET /api/dashboard/stats
const getStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalProducts,
      activeProducts,
      totalCategories,
      totalOrders,
      monthOrders,
      lastMonthOrders,
      totalCustomers,
      monthCustomers,
      revenueAgg,
      monthRevenueAgg,
      pendingOrders,
      recentOrders,
      topProducts,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ active: true }),
      Category.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.countDocuments({ orderStatus: "placed" }),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name email"),
      Order.aggregate([
        { $unwind: "$items" },
        { $group: { _id: "$items.name", count: { $sum: "$items.quantity" }, revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;
    const monthRevenue = monthRevenueAgg[0]?.total || 0;

    res.json({
      products: { total: totalProducts, active: activeProducts },
      categories: { total: totalCategories },
      orders: {
        total: totalOrders,
        thisMonth: monthOrders,
        lastMonth: lastMonthOrders,
        pending: pendingOrders,
      },
      customers: { total: totalCustomers, thisMonth: monthCustomers },
      revenue: { total: totalRevenue, thisMonth: monthRevenue },
      recentOrders,
      topProducts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/dashboard/orders-chart  — last 7 days order counts
const getOrdersChart = async (req, res) => {
  try {
    const days = 7;
    const results = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
      const count = await Order.countDocuments({ createdAt: { $gte: start, $lt: end } });
      const revenueAgg = await Order.aggregate([
        { $match: { createdAt: { $gte: start, $lt: end } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]);
      results.push({
        date: start.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        orders: count,
        revenue: revenueAgg[0]?.total || 0,
      });
    }
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStats, getOrdersChart };
