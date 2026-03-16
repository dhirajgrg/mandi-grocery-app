import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { productAPI } from "../../api/productAPI";
import { authAPI } from "../../api/authAPI";
import { orderAPI } from "../../api/orderAPI";
import { useSocket } from "../../context/SocketContext";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Users,
  ShieldCheck,
  LayoutDashboard,
  Eye,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  BarChart3,
  AlertTriangle,
  CreditCard,
  Activity,
  Search,
} from "lucide-react";

const defaultProductForm = {
  name: "",
  description: "",
  price: "",
  discount: "",
  category: "",
  brand: "",
  unit: "kg",
  stockQuantity: "",
  isAvailable: true,
  isOrganic: false,
  isFresh: false,
};

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState(defaultProductForm);
  const [productImageFile, setProductImageFile] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState("");
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [stats, setStats] = useState(null);
  const { onEvent } = useSocket();
  const [orderNotifCount, setOrderNotifCount] = useState(0);
  const [productSearch, setProductSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  // Track new-order notifications for the Orders tab badge
  useEffect(() => {
    return onEvent("order_update", (data) => {
      if (data.type === "new_order" && activeTab !== "orders") {
        setOrderNotifCount((c) => c + 1);
      }
    });
  }, [onEvent, activeTab]);

  // Clear the Orders tab badge when switching to Orders tab
  useEffect(() => {
    if (activeTab === "orders") {
      setOrderNotifCount(0);
    }
  }, [activeTab]);

  const inputClassName =
    "w-full px-4 py-2.5 rounded-xl bg-surface-light border border-border text-text text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all";

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productAPI.getAll();
      setProducts(res.data.data?.products || res.data.products || []);
    } catch {
      setProducts([]);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchUsers();
    fetchOrders();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await orderAPI.getStats();
      setStats(res.data.data);
    } catch {
      setStats(null);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await authAPI.getAllUsers();
      setUsers(res.data.data?.users || []);
    } catch {
      setUsers([]);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    try {
      await authAPI.deleteUser(userId);
      toast.success("User deleted");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const handleToggleActive = async (userId, currentValue) => {
    try {
      await authAPI.updateUser(userId, { isActive: !currentValue });
      toast.success(`User ${!currentValue ? "activated" : "suspended"}`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user");
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await orderAPI.getAll(orderStatusFilter || undefined);
      const newOrders = res.data.data?.orders || [];
      setOrders(newOrders);
    } catch {
      setOrders([]);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [orderStatusFilter]);

  // Listen for all order updates in real-time (new, cancelled, status changed)
  useEffect(() => {
    return onEvent("order_update", (data) => {
      if (data.type === "new_order") {
        toast(
          `New order #${data.orderNumber} from ${data.customerName} — Rs.${Math.round(data.totalAmount)}`,
          {
            icon: "🔔",
            style: { borderLeft: "4px solid #16a34a" },
            duration: 5000,
          },
        );
      } else if (data.type === "order_cancelled") {
        toast(`Order #${data.orderNumber} cancelled by ${data.customerName}`, {
          icon: "❌",
          style: { borderLeft: "4px solid #ef4444" },
          duration: 5000,
        });
      }
      fetchOrders();
      fetchStats();
    });
  }, [onEvent]);

  const resetFormState = () => {
    setProductForm(defaultProductForm);
    setProductImageFile(null);
    setProductImagePreview("");
    setEditingProduct(null);
  };

  const handleOpenCreate = () => {
    resetFormState();
    setShowForm(true);
  };

  const handleCloseForm = () => {
    resetFormState();
    setShowForm(false);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      discount: product.discount || "",
      category: product.category,
      brand: product.brand || "",
      unit: product.unit,
      stockQuantity: product.stockQuantity,
      isAvailable: product.isAvailable ?? true,
      isOrganic: product.isOrganic ?? false,
      isFresh: product.isFresh ?? false,
    });
    setProductImageFile(null);
    setProductImagePreview(product.images?.[0] || "");
    setShowForm(true);
  };

  const buildProductFormData = () => {
    const formData = new FormData();

    formData.append("name", productForm.name.trim());
    formData.append("description", productForm.description.trim());
    formData.append("price", String(Number(productForm.price)));
    formData.append("category", productForm.category.trim());
    formData.append("unit", productForm.unit);
    formData.append("stockQuantity", String(Number(productForm.stockQuantity)));
    formData.append("isAvailable", String(productForm.isAvailable));
    formData.append("isOrganic", String(productForm.isOrganic));
    formData.append("isFresh", String(productForm.isFresh));

    if (productForm.discount !== "") {
      formData.append("discount", String(Number(productForm.discount)));
    }

    if (productForm.brand.trim()) {
      formData.append("brand", productForm.brand.trim());
    }

    if (productImageFile) {
      formData.append("image", productImageFile);
    }

    return formData;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!editingProduct && !productImageFile) {
      toast.error("Please upload a product image");
      return;
    }

    const payload = buildProductFormData();

    try {
      if (editingProduct) {
        await productAPI.update(editingProduct._id, payload);
        toast.success("Product updated successfully");
      } else {
        await productAPI.create(payload);
        toast.success("Product created successfully");
      }

      handleCloseForm();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save product");
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Delete this product?")) {
      return;
    }

    try {
      await productAPI.delete(productId);
      toast.success("Product deleted");
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete product");
    }
  };

  const tabs = [
    { key: "products", label: "Products", icon: Package },
    { key: "orders", label: "Orders", icon: ClipboardList },
    { key: "users", label: "Users", icon: Users },
  ];

  const adminCount = users.filter((u) => u.role === "admin").length;
  const customerCount = users.filter((u) => u.role === "customer").length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Dashboard Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
          <LayoutDashboard size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-text-muted text-sm">Manage your store</p>
        </div>
      </div>

      {/* Charts Section */}
      <AdminChartsSection stats={stats} />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-8">
        <div className="p-4 rounded-2xl bg-white border border-border">
          <DollarSign size={20} className="text-green-600 mb-2" />
          <p className="text-2xl font-bold">
            Rs.{stats?.totalRevenue?.toLocaleString() || 0}
          </p>
          <p className="text-xs text-text-muted">Total Revenue</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-border">
          <ShoppingCart size={20} className="text-blue-600 mb-2" />
          <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
          <p className="text-xs text-text-muted">Total Orders</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-border">
          <Clock size={20} className="text-yellow-600 mb-2" />
          <p className="text-2xl font-bold">
            {stats?.ordersByStatus?.pending?.count || 0}
          </p>
          <p className="text-xs text-text-muted">Pending</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-border">
          <XCircle size={20} className="text-red-500 mb-2" />
          <p className="text-2xl font-bold">{stats?.cancelledCount || 0}</p>
          <p className="text-xs text-text-muted">Cancelled</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-surface-light rounded-xl p-1 w-fit">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === key
                ? "bg-primary text-white"
                : "text-text-muted hover:text-text"
            }`}
          >
            <Icon size={16} />
            {label}
            {key === "orders" &&
              orderNotifCount > 0 &&
              activeTab !== "orders" && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                  {orderNotifCount}
                </span>
              )}
          </button>
        ))}
      </div>

      {/* Products Tab */}
      {activeTab === "products" && (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                type="text"
                placeholder="Search by name or category..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className={inputClassName + " pl-10!"}
              />
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <p className="text-text-muted text-sm">
                {
                  products.filter((p) => {
                    if (!productSearch.trim()) return true;
                    const q = productSearch.toLowerCase();
                    return (
                      p.name?.toLowerCase().includes(q) ||
                      p.category?.toLowerCase().includes(q)
                    );
                  }).length
                }{" "}
                of {products.length}
              </p>
              <button
                onClick={handleOpenCreate}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-xl transition-all"
              >
                <Plus size={16} />
                Add Product
              </button>
            </div>
          </div>

          {showForm && (
            <div className="mb-6 p-6 rounded-2xl bg-white border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">
                  {editingProduct ? "Edit Product" : "New Product"}
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="p-1 text-text-muted hover:text-text"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        name: event.target.value,
                      })
                    }
                    required
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={productForm.category}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        category: event.target.value,
                      })
                    }
                    required
                    className={inputClassName}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Description
                  </label>
                  <textarea
                    value={productForm.description}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        description: event.target.value,
                      })
                    }
                    required
                    rows={2}
                    className={inputClassName + " resize-none"}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        price: event.target.value,
                      })
                    }
                    required
                    min="0"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    value={productForm.discount}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        discount: event.target.value,
                      })
                    }
                    min="0"
                    max="100"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={productForm.stockQuantity}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        stockQuantity: event.target.value,
                      })
                    }
                    min="0"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Unit
                  </label>
                  <select
                    value={productForm.unit}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        unit: event.target.value,
                      })
                    }
                    className={inputClassName}
                  >
                    {["kg", "gram", "piece", "pack", "liter"].map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={productForm.brand}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        brand: event.target.value,
                      })
                    }
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Product Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setProductImageFile(event.target.files?.[0] || null)
                    }
                    className={inputClassName}
                  />
                  <p className="mt-1 text-xs text-text-muted">
                    {productImageFile
                      ? `Selected: ${productImageFile.name}`
                      : productImagePreview
                        ? "Current image will be kept unless you upload a new one."
                        : "Upload one image file (required for new product)."}
                  </p>
                </div>

                {/* Toggles */}
                <div className="sm:col-span-2 flex flex-wrap gap-6 py-2">
                  {[
                    { key: "isAvailable", label: "Available" },
                    { key: "isOrganic", label: "Organic" },
                    { key: "isFresh", label: "Fresh" },
                  ].map(({ key, label }) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setProductForm({
                            ...productForm,
                            [key]: !productForm[key],
                          })
                        }
                        className={`relative w-10 h-5 rounded-full transition-colors ${
                          productForm[key] ? "bg-primary" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform shadow-sm ${
                            productForm[key] ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                      <span className="text-xs font-medium text-text-muted">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="sm:col-span-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-4 py-2 bg-surface-light text-text-muted rounded-xl text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-xl transition-all"
                  >
                    <Save size={14} />
                    {editingProduct ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <p className="text-center text-text-muted py-12">Loading...</p>
          ) : (
            <div className="space-y-3">
              {products
                .filter((p) => {
                  if (!productSearch.trim()) return true;
                  const q = productSearch.toLowerCase();
                  return (
                    p.name?.toLowerCase().includes(q) ||
                    p.category?.toLowerCase().includes(q)
                  );
                })
                .map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between p-4 rounded-xl bg-white border border-border"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-surface-light flex items-center justify-center shrink-0 overflow-hidden">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            loading="lazy"
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <Package size={16} className="text-text-muted/50" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-text-muted">
                          {product.category} · Rs. {product.price} · Stock:{" "}
                          {product.stockQuantity}
                          {!product.isAvailable && (
                            <span className="ml-1 text-error font-medium">
                              · Unavailable
                            </span>
                          )}
                          {product.isOrganic && (
                            <span className="ml-1 text-green-600 font-medium">
                              · Organic
                            </span>
                          )}
                          {product.isFresh && (
                            <span className="ml-1 text-sky-500 font-medium">
                              · Fresh
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="p-2 rounded-lg hover:bg-surface-light text-text-muted hover:text-text transition-all"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-2 rounded-lg hover:bg-error/10 text-text-muted hover:text-error transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}

              {!loading && products.length === 0 && (
                <p className="text-center text-text-muted py-12">
                  No products yet.
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className={inputClassName + " pl-10!"}
              />
            </div>
            <p className="text-text-muted text-sm shrink-0">
              {
                users.filter((u) => {
                  if (!userSearch.trim()) return true;
                  const q = userSearch.toLowerCase();
                  return (
                    u.name?.toLowerCase().includes(q) ||
                    u.email?.toLowerCase().includes(q)
                  );
                }).length
              }{" "}
              of {users.length} users
            </p>
          </div>
          <div className="space-y-3">
            {users
              .filter((u) => {
                if (!userSearch.trim()) return true;
                const q = userSearch.toLowerCase();
                return (
                  u.name?.toLowerCase().includes(q) ||
                  u.email?.toLowerCase().includes(q)
                );
              })
              .map((u) => (
                <div
                  key={u._id}
                  className="rounded-xl bg-white border border-border overflow-hidden"
                >
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-surface-light flex items-center justify-center shrink-0 overflow-hidden">
                        {u.profilePic ? (
                          <img
                            src={u.profilePic}
                            alt={u.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-bold text-text-muted">
                            {u.name?.charAt(0)?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{u.name}</p>
                        <p className="text-xs text-text-muted">
                          {u.email}
                          {u.mobile && <span> · +977 {u.mobile}</span>}
                          {" · "}
                          <span
                            className={`font-medium ${u.role === "admin" ? "text-black" : "text-text-muted"}`}
                          >
                            {u.role}
                          </span>{" "}
                          · Joined {new Date(u.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setExpandedUserId(
                          expandedUserId === u._id ? null : u._id,
                        )
                      }
                      className="p-2 rounded-lg hover:bg-surface-light text-text-muted hover:text-text transition-all shrink-0"
                      title="View details"
                    >
                      {expandedUserId === u._id ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </button>
                  </div>

                  {/* Expanded details */}
                  {expandedUserId === u._id && (
                    <div className="px-4 pb-4 pt-0 border-t border-border">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                        <div className="px-3 py-2 bg-surface-light rounded-lg">
                          <p className="text-[10px] text-text-muted uppercase tracking-wider">
                            Full Name
                          </p>
                          <p className="text-sm font-medium">{u.name}</p>
                        </div>
                        <div className="px-3 py-2 bg-surface-light rounded-lg">
                          <p className="text-[10px] text-text-muted uppercase tracking-wider">
                            Email
                          </p>
                          <p className="text-sm font-medium">{u.email}</p>
                        </div>
                        <div className="px-3 py-2 bg-surface-light rounded-lg">
                          <p className="text-[10px] text-text-muted uppercase tracking-wider">
                            Mobile
                          </p>
                          <p className="text-sm font-medium">
                            {u.mobile ? `+977 ${u.mobile}` : "N/A"}
                          </p>
                        </div>
                        <div className="px-3 py-2 bg-surface-light rounded-lg">
                          <p className="text-[10px] text-text-muted uppercase tracking-wider">
                            Role
                          </p>
                          <p className="text-sm font-medium capitalize">
                            {u.role}
                          </p>
                        </div>
                        <div className="px-3 py-2 bg-surface-light rounded-lg">
                          <p className="text-[10px] text-text-muted uppercase tracking-wider">
                            Email Verified
                          </p>
                          <p className="text-sm font-medium">
                            {u.emailVerified ? "Yes" : "No"}
                          </p>
                        </div>
                        <div className="px-3 py-2 bg-surface-light rounded-lg">
                          <p className="text-[10px] text-text-muted uppercase tracking-wider">
                            Joined
                          </p>
                          <p className="text-sm font-medium">
                            {new Date(u.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Admin actions */}
                      {u.role !== "admin" && (
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-text-muted">
                              {u.isActive ? "Active" : "Suspended"}
                            </span>
                            <button
                              onClick={() =>
                                handleToggleActive(u._id, u.isActive)
                              }
                              className={`relative w-10 h-5 rounded-full transition-colors ${
                                u.isActive ? "bg-primary" : "bg-gray-300"
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform shadow-sm ${
                                  u.isActive ? "translate-x-5" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-error/10 text-error hover:bg-error/20 transition-all"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            {users.length === 0 && (
              <p className="text-center text-text-muted py-12">
                No users found.
              </p>
            )}
          </div>
        </>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <AdminOrdersTab
          orders={orders}
          loading={loading}
          orderStatusFilter={orderStatusFilter}
          setOrderStatusFilter={setOrderStatusFilter}
          expandedOrderId={expandedOrderId}
          setExpandedOrderId={setExpandedOrderId}
          fetchOrders={fetchOrders}
          fetchStats={fetchStats}
          orderSearch={orderSearch}
          setOrderSearch={setOrderSearch}
          inputClassName={inputClassName}
        />
      )}
    </div>
  );
};

export default AdminPage;

// ========================
// CHART COLORS
// ========================
const STATUS_COLORS = {
  pending: "#eab308",
  confirmed: "#3b82f6",
  packed: "#6366f1",
  out_for_delivery: "#f97316",
  delivered: "#22c55e",
  cancelled: "#ef4444",
};

const PIE_COLORS = [
  "#22c55e",
  "#3b82f6",
  "#6366f1",
  "#f97316",
  "#eab308",
  "#ef4444",
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl px-4 py-3 shadow-lg text-sm">
      <p className="font-semibold text-text mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="text-xs">
          {p.name}:{" "}
          {typeof p.value === "number" &&
          p.name.toLowerCase().includes("revenue")
            ? `Rs.${p.value.toLocaleString()}`
            : p.value}
        </p>
      ))}
    </div>
  );
};

// ========================
// CHARTS SECTION (always visible)
// ========================
const AdminChartsSection = ({ stats }) => {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white border border-border rounded-2xl p-5 h-[300px] animate-pulse"
          >
            <div className="h-4 w-32 bg-surface-light rounded mb-6" />
            <div className="h-full bg-surface-light/50 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  const statusData = Object.entries(stats.ordersByStatus || {}).map(
    ([key, val]) => ({
      name: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      value: val.count,
      amount: val.amount,
      fill: STATUS_COLORS[key] || "#94a3b8",
    }),
  );

  const paymentData = Object.entries(stats.byPaymentMethod || {}).map(
    ([key, val]) => ({
      name: key.toUpperCase(),
      count: val.count,
      amount: val.amount,
    }),
  );

  const dailyData = (stats.dailyOrders || []).map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div className="space-y-6 my-6">
      {/* Charts Row 1: Revenue & Orders Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Area Chart */}
        <div className="bg-white border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-primary" />
            <h3 className="font-semibold text-sm">Revenue Trend</h3>
          </div>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) =>
                    `Rs.${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#revGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-text-muted py-16 text-sm">
              No data yet
            </p>
          )}
        </div>

        {/* Orders Bar Chart */}
        <div className="bg-white border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-primary" />
            <h3 className="font-semibold text-sm">Daily Orders</h3>
          </div>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  label={{
                    value: "Orders",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 10, fill: "#6b7280" },
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) =>
                    `Rs.${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                  }
                  label={{
                    value: "Revenue",
                    angle: 90,
                    position: "insideRight",
                    style: { fontSize: 10, fill: "#6b7280" },
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11 }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="delivered"
                  name="Delivered"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                  barSize={14}
                />
                <Bar
                  yAxisId="left"
                  dataKey="cancelled"
                  name="Cancelled"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  barSize={14}
                />
                <Bar
                  yAxisId="left"
                  dataKey="orders"
                  name="Total"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  barSize={14}
                />
                <Bar
                  yAxisId="right"
                  dataKey="revenue"
                  name="Revenue"
                  fill="#a855f7"
                  radius={[4, 4, 0, 0]}
                  barSize={14}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-text-muted py-16 text-sm">
              No data yet
            </p>
          )}
        </div>
      </div>

      {/* Charts Row 2: Status Pie + Payment Method */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Pie */}
        <div className="bg-white border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList size={16} className="text-primary" />
            <h3 className="font-semibold text-sm">Order Status Breakdown</h3>
          </div>
          {statusData.length > 0 ? (
            <div className="flex items-center">
              <ResponsiveContainer width="50%" height={220}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    paddingAngle={3}
                    stroke="none"
                  >
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [value, name]}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {statusData.map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: s.fill }}
                      />
                      <span className="text-xs text-text-muted">{s.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold">{s.value}</span>
                      <span className="text-[10px] text-text-muted ml-1">
                        (Rs.{s.amount?.toLocaleString()})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-text-muted py-16 text-sm">
              No orders yet
            </p>
          )}
        </div>

        {/* Payment Method Breakdown */}
        <div className="bg-white border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={16} className="text-primary" />
            <h3 className="font-semibold text-sm">Payment Methods</h3>
          </div>
          {paymentData.length > 0 ? (
            <div className="flex items-center">
              <ResponsiveContainer width="50%" height={220}>
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="count"
                    paddingAngle={3}
                    stroke="none"
                  >
                    {paymentData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {paymentData.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-surface-light rounded-xl"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      />
                      <span className="text-xs font-medium">{p.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold">{p.count} orders</p>
                      <p className="text-[10px] text-text-muted">
                        Rs.{p.amount?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-text-muted py-16 text-sm">
              No data yet
            </p>
          )}
        </div>
      </div>

      {/* Cancelled Orders by User */}
      <div className="bg-white border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={16} className="text-red-500" />
          <h3 className="font-semibold text-sm">
            Top Cancellations by Customer
          </h3>
          <span className="ml-auto text-[10px] font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-full">
            {stats.cancelledCount} total
          </span>
        </div>
        {stats.cancelledByUser?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-text-muted border-b border-border">
                  <th className="pb-3 pr-4">#</th>
                  <th className="pb-3 pr-4">Customer</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Order Numbers</th>
                  <th className="pb-3 pr-4 text-center">Cancelled</th>
                  <th className="pb-3 text-right">Lost Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.cancelledByUser.map((item, idx) => (
                  <tr key={item._id} className="hover:bg-surface-light/50">
                    <td className="py-3 pr-4 text-text-muted">{idx + 1}</td>
                    <td className="py-3 pr-4 font-medium">
                      {item.user?.name || "Deleted User"}
                    </td>
                    <td className="py-3 pr-4 text-text-muted">
                      {item.user?.email || "—"}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-1">
                        {item.orderNumbers?.map((num) => (
                          <span
                            key={num}
                            className="inline-block text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-red-50 text-red-600"
                          >
                            #{num}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-center">
                      <span className="inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full bg-red-50 text-red-600 text-xs font-bold">
                        {item.count}
                      </span>
                    </td>
                    <td className="py-3 text-right font-semibold text-red-600">
                      Rs.{Math.round(item.totalLost).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-text-muted py-10 text-sm">
            No cancellations yet
          </p>
        )}
      </div>
    </div>
  );
};

const ORDER_STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "text-yellow-600 bg-yellow-50",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle,
    color: "text-blue-600 bg-blue-50",
  },
  packed: {
    label: "Packed",
    icon: Package,
    color: "text-indigo-600 bg-indigo-50",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    icon: Truck,
    color: "text-orange-600 bg-orange-50",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle,
    color: "text-green-600 bg-green-50",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-red-600 bg-red-50",
  },
};

const NEXT_STATUS = {
  pending: "confirmed",
  confirmed: "packed",
  packed: "out_for_delivery",
  out_for_delivery: "delivered",
};

const AdminOrdersTab = ({
  orders,
  loading,
  orderStatusFilter,
  setOrderStatusFilter,
  expandedOrderId,
  setExpandedOrderId,
  fetchOrders,
  fetchStats,
  orderSearch,
  setOrderSearch,
  inputClassName,
}) => {
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      toast.success(
        `Order status updated to "${newStatus.replace(/_/g, " ")}"`,
      );
      fetchOrders();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!orderSearch.trim()) return true;
    const q = orderSearch.trim();
    return String(o.orderNumber).includes(q);
  });

  return (
    <>
      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            placeholder="Search by order number..."
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
            className={inputClassName + " pl-10!"}
          />
        </div>
        <p className="text-text-muted text-sm shrink-0">
          {filteredOrders.length} of {orders.length} orders
        </p>
      </div>
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {[
          "",
          "pending",
          "confirmed",
          "packed",
          "out_for_delivery",
          "delivered",
          "cancelled",
        ].map((s) => (
          <button
            key={s}
            onClick={() => setOrderStatusFilter(s)}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              orderStatusFilter === s
                ? "bg-primary text-white"
                : "bg-surface-light text-text-muted hover:text-text"
            }`}
          >
            {s === ""
              ? "All"
              : s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-text-muted py-12">Loading...</p>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-10 text-center">
          <ClipboardList
            size={48}
            className="mx-auto text-text-muted/30 mb-4"
          />
          <p className="text-sm text-text-muted">
            {orderSearch.trim()
              ? "No matching orders found."
              : "No orders found."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const config =
              ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.pending;
            const StatusIcon = config.icon;
            const isExpanded = expandedOrderId === order._id;
            const nextStatus = NEXT_STATUS[order.status];

            return (
              <div
                key={order._id}
                className="rounded-xl bg-white border border-border overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedOrderId(isExpanded ? null : order._id)
                  }
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-xl ${config.color}`}>
                      <StatusIcon size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">
                        #{order.orderNumber}
                      </p>
                      <p className="text-xs text-text-muted truncate">
                        {order.userId?.name || "Unknown"} ·{" "}
                        {order.userId?.email || ""}
                        {order.userId?.mobile && (
                          <span> · +977 {order.userId.mobile}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-bold">
                        Rs.{Math.round(order.totalAmount)}
                      </p>
                      <span
                        className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${config.color}`}
                      >
                        {config.label}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-text-muted" />
                    ) : (
                      <ChevronDown size={16} className="text-text-muted" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border px-4 py-3 space-y-3">
                    {/* Items */}
                    <div className="space-y-2">
                      {order.items.map((item, idx) => {
                        const product = item.productId;
                        const discountedPrice =
                          item.price * (1 - (item.discount || 0) / 100);
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-sm"
                          >
                            <div className="flex items-center gap-2">
                              {product?.images?.[0] && (
                                <img
                                  src={product.images[0]}
                                  alt={product?.name}
                                  loading="lazy"
                                  className="w-8 h-8 rounded object-cover"
                                />
                              )}
                              <div>
                                <p className="font-medium">
                                  {product?.name || "Unknown"}
                                </p>
                                {item.discount > 0 && (
                                  <p className="text-xs text-text-muted line-through">
                                    Rs. {item.price}/{product?.unit}
                                  </p>
                                )}
                                <p className="text-xs text-text-muted">
                                  {item.quantity} × Rs.
                                  {Math.round(discountedPrice)}/{product?.unit}
                                  {item.discount > 0 && (
                                    <span className="ml-1 text-green-600">
                                      (-{item.discount}%)
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <p className="font-semibold">
                              Rs.{Math.round(discountedPrice * item.quantity)}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Delivery & Date */}
                    <div className="text-xs text-text-muted border-t border-border pt-2 space-y-1">
                      {order.orderType === "takeaway" ? (
                        <p className="flex items-center gap-1">
                          <span className="font-medium text-amber-700">
                            Takeaway - Store Pickup
                          </span>
                        </p>
                      ) : order.deliveryLocation?.address ? (
                        <p>
                          <span className="font-medium text-text">
                            Delivery:
                          </span>{" "}
                          {order.deliveryLocation.address}
                        </p>
                      ) : null}
                      <p>
                        <span className="font-medium text-text">Placed:</span>{" "}
                        {new Date(order.createdAt).toLocaleString("en-IN")}
                      </p>
                      <p>
                        <span className="font-medium text-text">Payment:</span>{" "}
                        {order.paymentMethod?.toUpperCase()}
                      </p>
                    </div>

                    {/* Admin actions */}
                    <div className="flex gap-2 pt-1">
                      {nextStatus && (
                        <button
                          onClick={() =>
                            handleStatusChange(order._id, nextStatus)
                          }
                          className="flex-1 py-2 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors"
                        >
                          Mark as{" "}
                          {nextStatus
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                        </button>
                      )}
                      {order.status !== "cancelled" &&
                        order.status !== "delivered" && (
                          <button
                            onClick={() =>
                              handleStatusChange(order._id, "cancelled")
                            }
                            className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};
