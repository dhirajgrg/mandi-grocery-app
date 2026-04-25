import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { productAPI } from "../../api/productAPI";
import { authAPI } from "../../api/authAPI";
import { orderAPI } from "../../api/orderAPI";
import { categoryAPI } from "../../api/categoryAPI";
import { bannerAPI } from "../../api/bannerAPI";
import { settingsAPI } from "../../api/settingsAPI";
import { useSocket } from "../../context/SocketContext";
import LocationPicker from "../../components/ui/LocationPicker";
import ConfirmModal from "../../components/ui/ConfirmModal";
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
  Upload,
  Image,
  FolderOpen,
  Menu,
  ChevronLeft,
  Hash,
  Image as ImageIcon,
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    () => searchParams.get("tab") || "overview",
  );
  const [highlightPending, setHighlightPending] = useState(false);

  // Handle ?tab=orders from bell click
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
      if (tab === "orders") setHighlightPending(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);
  const [sidebarOpen, setSidebarOpen] = useState(
    () => window.innerWidth >= 768,
  );

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
  const [editingUserId, setEditingUserId] = useState(null);
  const [editUserForm, setEditUserForm] = useState({});
  const [stats, setStats] = useState(null);
  const { onEvent, clearNotifs, stopOrderSound } = useSocket();
  const [orderNotifCount, setOrderNotifCount] = useState(0);
  const [productSearch, setProductSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // Banner state
  const [banners, setBanners] = useState([]);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [bannerForm, setBannerForm] = useState({
    title: "",
    highlight: "",
    description: "",
    ctaText: "Shop Now",
    ctaLink: "/products",
    isActive: true,
    order: 0,
  });
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [bannerImagePreview, setBannerImagePreview] = useState("");
  const [bannerDragActive, setBannerDragActive] = useState(false);
  const [shopOpen, setShopOpen] = useState(true);
  const [togglingShop, setTogglingShop] = useState(false);

  // Track new-order notifications for the Orders tab badge
  useEffect(() => {
    return onEvent("order_update", (data) => {
      if (data.type === "new_order" && activeTab !== "orders") {
        setOrderNotifCount((c) => c + 1);
      }
    });
  }, [onEvent, activeTab]);

  // Clear badges and stop sound when switching to Orders tab
  useEffect(() => {
    if (activeTab === "orders") {
      setOrderNotifCount(0);
      clearNotifs();
      stopOrderSound();
    }
  }, [activeTab, clearNotifs, stopOrderSound]);

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

  const fetchCategories = async () => {
    try {
      const res = await categoryAPI.getAll();
      setCategories(res.data.data?.categories || []);
    } catch {
      setCategories([]);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await categoryAPI.create(newCategoryName.trim());
      toast.success("Category created");
      setNewCategoryName("");
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create category");
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await categoryAPI.delete(id);
      toast.success("Category deleted");
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete category");
    }
  };

  const fetchBanners = async () => {
    try {
      const res = await bannerAPI.getAllAdmin();
      setBanners(res.data.data?.banners || []);
    } catch {
      setBanners([]);
    }
  };

  const resetBannerForm = () => {
    setBannerForm({
      title: "",
      highlight: "",
      description: "",
      ctaText: "Shop Now",
      ctaLink: "/products",
      isActive: true,
      order: 0,
    });
    setBannerImageFile(null);
    setBannerImagePreview("");
    setEditingBanner(null);
  };

  const handleOpenBannerCreate = () => {
    resetBannerForm();
    const maxOrder =
      banners.length > 0 ? Math.max(...banners.map((b) => b.order || 0)) : -1;
    setBannerForm((prev) => ({ ...prev, order: maxOrder + 1 }));
    setShowBannerForm(true);
  };

  const handleCloseBannerForm = () => {
    resetBannerForm();
    setShowBannerForm(false);
  };

  const handleEditBanner = (banner) => {
    setEditingBanner(banner);
    setBannerForm({
      title: banner.title || "",
      highlight: banner.highlight || "",
      description: banner.description || "",
      ctaText: banner.ctaText || "Shop Now",
      ctaLink: banner.ctaLink || "/products",
      isActive: banner.isActive ?? true,
      order: banner.order || 0,
    });
    setBannerImageFile(null);
    setBannerImagePreview(banner.image || "");
    setShowBannerForm(true);
  };

  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("title", bannerForm.title);
    fd.append("highlight", bannerForm.highlight);
    fd.append("description", bannerForm.description);
    fd.append("ctaText", bannerForm.ctaText);
    if (!editingBanner) {
      fd.append("ctaLink", bannerForm.ctaLink);
      fd.append("isActive", String(bannerForm.isActive));
      fd.append("order", String(bannerForm.order));
    }
    if (bannerImageFile) fd.append("image", bannerImageFile);
    try {
      if (editingBanner) {
        await bannerAPI.update(editingBanner._id, fd);
        toast.success("Banner updated");
      } else {
        await bannerAPI.create(fd);
        toast.success("Banner created");
      }
      handleCloseBannerForm();
      fetchBanners();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save banner");
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm("Delete this banner?")) return;
    try {
      await bannerAPI.delete(id);
      toast.success("Banner deleted");
      fetchBanners();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete banner");
    }
  };

  const fetchShopStatus = async () => {
    try {
      const res = await settingsAPI.getShopStatus();
      setShopOpen(res.data.data?.isOpen ?? true);
    } catch {
      // default to open
    }
  };

  const handleToggleShop = async () => {
    setTogglingShop(true);
    try {
      const res = await settingsAPI.toggleShopStatus();
      const isOpen = res.data.data?.isOpen;
      setShopOpen(isOpen);
      toast.success(`Shop is now ${isOpen ? "open" : "closed"}`);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to toggle shop status",
      );
    } finally {
      setTogglingShop(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchUsers();
    fetchOrders();
    fetchStats();
    fetchCategories();
    fetchBanners();
    fetchShopStatus();
  }, []);

  const fetchStats = async (trendingPeriod) => {
    try {
      const res = await orderAPI.getStats(
        trendingPeriod ? { trendingPeriod } : undefined,
      );
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

  const handleStartEditUser = (u) => {
    setEditingUserId(u._id);
    setEditUserForm({
      name: u.name || "",
      role: u.role || "customer",
      isActive: u.isActive ?? true,
    });
  };

  const handleSaveEditUser = async (userId) => {
    try {
      await authAPI.updateUser(userId, editUserForm);
      toast.success("User updated");
      setEditingUserId(null);
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
    return onEvent("order_update", () => {
      fetchOrders();
      fetchStats();
    });
  }, [onEvent]);

  // Listen for stock updates and refresh products + stats
  useEffect(() => {
    return onEvent("stock_updated", () => {
      fetchProducts();
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
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "products", label: "Products", icon: Package },
    { key: "categories", label: "Categories", icon: FolderOpen },
    { key: "banners", label: "Banners", icon: ImageIcon },
    { key: "orders", label: "Orders", icon: ClipboardList },
    { key: "users", label: "Users", icon: Users },
  ];

  const adminCount = users.filter((u) => u.role === "admin").length;
  const customerCount = users.filter((u) => u.role === "customer").length;

  const filteredProducts = products.filter((p) => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p._id?.toLowerCase().includes(q)
    );
  });

  const filteredUsers = users.filter((u) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.mobile?.includes(q) ||
      u._id?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside
        className={`sticky top-16 h-[calc(100vh-4rem)] bg-white border-r border-border flex flex-col transition-all duration-300 shrink-0 z-10 w-14 ${
          sidebarOpen ? "md:w-56" : "md:w-14"
        }`}
      >
        <div className="hidden md:flex items-center justify-between p-3 border-b border-border">
          {sidebarOpen && (
            <span className="text-sm font-bold text-primary truncate">
              Admin
            </span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-surface-light text-text-muted hover:text-text transition-all"
          >
            {sidebarOpen ? <ChevronLeft size={16} /> : <Menu size={16} />}
          </button>
        </div>

        <nav className="flex-1 py-2 space-y-0.5 px-2 overflow-y-auto">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              title={label}
              className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === key
                  ? "bg-primary text-white"
                  : "text-text-muted hover:text-text hover:bg-surface-light"
              }`}
            >
              <Icon size={18} className="shrink-0" />
              {sidebarOpen && (
                <span className="hidden md:inline truncate">{label}</span>
              )}
              {key === "orders" &&
                orderNotifCount > 0 &&
                activeTab !== "orders" && (
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse ${sidebarOpen ? "md:ml-auto" : ""} absolute -top-1 -right-1 md:relative md:top-auto md:right-auto`}
                  >
                    {orderNotifCount}
                  </span>
                )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
        {/* ========== OVERVIEW ========== */}
        {activeTab === "overview" && (
          <>
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">Dashboard Overview</h1>
                  <p className="text-text-muted text-sm">
                    Your store at a glance
                  </p>
                </div>
                <button
                  onClick={handleToggleShop}
                  disabled={togglingShop}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                    shopOpen
                      ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                      : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                  } disabled:opacity-50`}
                >
                  <div
                    className={`w-9 h-5 rounded-full relative transition-colors ${
                      shopOpen ? "bg-green-500" : "bg-red-400"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        shopOpen ? "left-4" : "left-0.5"
                      }`}
                    />
                  </div>
                  Shop {shopOpen ? "Open" : "Closed"}
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
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
                <Package size={20} className="text-indigo-600 mb-2" />
                <p className="text-2xl font-bold">{products.length}</p>
                <p className="text-xs text-text-muted">Products</p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-border">
                <Users size={20} className="text-orange-600 mb-2" />
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-xs text-text-muted">Users</p>
              </div>
            </div>

            <AdminChartsSection stats={stats} fetchStats={fetchStats} />
          </>
        )}

        {/* ========== PRODUCTS ========== */}
        {activeTab === "products" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold">Products</h1>
              <button
                onClick={handleOpenCreate}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-xl transition-all"
              >
                <Plus size={16} />
                Add Product
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
              <div className="relative flex-1 w-full sm:max-w-lg">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  type="text"
                  placeholder="Search by name, category, or ID..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className={inputClassName + " !pl-10"}
                />
              </div>
              <p className="text-text-muted text-sm shrink-0">
                {filteredProducts.length} of {products.length}
              </p>
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
                      onChange={(e) =>
                        setProductForm({ ...productForm, name: e.target.value })
                      }
                      required
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">
                      Category
                    </label>
                    <select
                      value={productForm.category}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          category: e.target.value,
                        })
                      }
                      required
                      className={inputClassName}
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-text-muted mb-1">
                      Description
                    </label>
                    <textarea
                      value={productForm.description}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          description: e.target.value,
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
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          price: e.target.value,
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
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          discount: e.target.value,
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
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          stockQuantity: e.target.value,
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
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          unit: e.target.value,
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
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          brand: e.target.value,
                        })
                      }
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">
                      Product Image
                    </label>
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragActive(true);
                      }}
                      onDragLeave={() => setDragActive(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragActive(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file && file.type.startsWith("image/")) {
                          setProductImageFile(file);
                        }
                      }}
                      onClick={() =>
                        document.getElementById("product-image-input").click()
                      }
                      className={`relative flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                        dragActive
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-surface-light"
                      }`}
                    >
                      {productImageFile || productImagePreview ? (
                        <div className="relative w-full h-full">
                          <img
                            src={
                              productImageFile
                                ? URL.createObjectURL(productImageFile)
                                : productImagePreview
                            }
                            alt="Preview"
                            className="w-full h-full object-contain rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProductImageFile(null);
                              setProductImagePreview("");
                            }}
                            className="absolute top-1 right-1 p-1 bg-white/90 rounded-full shadow hover:bg-red-50"
                          >
                            <X size={14} className="text-error" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload
                            size={24}
                            className="text-text-muted/50 mb-2"
                          />
                          <p className="text-xs text-text-muted">
                            Drag & drop or{" "}
                            <span className="text-primary font-medium">
                              choose file
                            </span>
                          </p>
                          <p className="text-[10px] text-text-muted/50 mt-1">
                            PNG, JPG up to 5MB
                          </p>
                        </>
                      )}
                      <input
                        id="product-image-input"
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setProductImageFile(e.target.files?.[0] || null)
                        }
                        className="hidden"
                      />
                    </div>
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
                              productForm[key]
                                ? "translate-x-5"
                                : "translate-x-0"
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
                {filteredProducts.map((product) => (
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
                          {product.category} · Rs.{product.price} · Stock:{" "}
                          {product.stockQuantity}
                          {!product.isAvailable && (
                            <span className="ml-1 text-error font-medium">
                              · Unavailable
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-text-muted/50 font-mono">
                          ID: {product._id}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="p-2 rounded-lg hover:bg-surface-light text-text-muted hover:text-text transition-all"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-2 rounded-lg hover:bg-error/10 text-text-muted hover:text-error transition-all"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                {!loading && filteredProducts.length === 0 && (
                  <p className="text-center text-text-muted py-12">
                    {productSearch.trim()
                      ? "No products match your search."
                      : "No products yet."}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {/* ========== CATEGORIES ========== */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            <h1 className="text-xl font-bold">Categories</h1>

            <div className="p-6 rounded-2xl bg-white border border-border">
              <h2 className="font-semibold mb-4">Add Category</h2>
              <form
                onSubmit={handleCreateCategory}
                className="flex items-center gap-3"
              >
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Category name..."
                  className={inputClassName + " max-w-sm"}
                />
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-xl transition-all shrink-0"
                >
                  <Plus size={16} />
                  Add
                </button>
              </form>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-text-muted">
                {categories.length} categories
              </p>
              {categories.map((cat) => (
                <div
                  key={cat._id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FolderOpen size={14} className="text-primary" />
                    </div>
                    <span className="text-sm font-medium">{cat.name}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(cat._id, cat.name)}
                    className="p-2 rounded-lg hover:bg-error/10 text-text-muted hover:text-error transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-center text-text-muted py-12">
                  No categories yet. Add one above.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ========== BANNERS ========== */}
        {activeTab === "banners" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">Carousel Banners</h1>
              <button
                onClick={handleOpenBannerCreate}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-xl transition-all"
              >
                <Plus size={16} />
                Add Banner
              </button>
            </div>

            {showBannerForm && (
              <div className="p-6 rounded-2xl bg-white border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">
                    {editingBanner ? "Edit Banner" : "New Banner"}
                  </h2>
                  <button
                    onClick={handleCloseBannerForm}
                    className="p-1 text-text-muted hover:text-text"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form
                  onSubmit={handleBannerSubmit}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={bannerForm.title}
                      onChange={(e) =>
                        setBannerForm({ ...bannerForm, title: e.target.value })
                      }
                      placeholder="e.g. Fresh Groceries,"
                      className={inputClassName}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">
                      Highlight Text
                    </label>
                    <input
                      type="text"
                      value={bannerForm.highlight}
                      onChange={(e) =>
                        setBannerForm({
                          ...bannerForm,
                          highlight: e.target.value,
                        })
                      }
                      placeholder="e.g. Delivered Fast"
                      className={inputClassName}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-text-muted mb-1">
                      Description
                    </label>
                    <textarea
                      value={bannerForm.description}
                      onChange={(e) =>
                        setBannerForm({
                          ...bannerForm,
                          description: e.target.value,
                        })
                      }
                      rows={2}
                      className={inputClassName + " resize-none"}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={bannerForm.ctaText}
                      onChange={(e) =>
                        setBannerForm({
                          ...bannerForm,
                          ctaText: e.target.value,
                        })
                      }
                      className={inputClassName}
                    />
                  </div>
                  {!editingBanner && (
                    <div>
                      <label className="block text-xs font-medium text-text-muted mb-1">
                        Button Link
                      </label>
                      <input
                        type="text"
                        value={bannerForm.ctaLink}
                        onChange={(e) =>
                          setBannerForm({
                            ...bannerForm,
                            ctaLink: e.target.value,
                          })
                        }
                        className={inputClassName}
                      />
                    </div>
                  )}
                  {!editingBanner && (
                    <div>
                      <label className="block text-xs font-medium text-text-muted mb-1">
                        Order (lower = first)
                      </label>
                      <input
                        type="number"
                        value={bannerForm.order}
                        onChange={(e) =>
                          setBannerForm({
                            ...bannerForm,
                            order: e.target.value,
                          })
                        }
                        className={inputClassName}
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">
                      Banner Image
                    </label>
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setBannerDragActive(true);
                      }}
                      onDragLeave={() => setBannerDragActive(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setBannerDragActive(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file && file.type.startsWith("image/")) {
                          setBannerImageFile(file);
                        }
                      }}
                      onClick={() =>
                        document.getElementById("banner-image-input").click()
                      }
                      className={`relative flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                        bannerDragActive
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-surface-light"
                      }`}
                    >
                      {bannerImageFile || bannerImagePreview ? (
                        <div className="relative w-full h-full">
                          <img
                            src={
                              bannerImageFile
                                ? URL.createObjectURL(bannerImageFile)
                                : bannerImagePreview
                            }
                            alt="Preview"
                            className="w-full h-full object-contain rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setBannerImageFile(null);
                              setBannerImagePreview("");
                            }}
                            className="absolute top-1 right-1 p-1 bg-white/90 rounded-full shadow hover:bg-red-50"
                          >
                            <X size={14} className="text-error" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload
                            size={24}
                            className="text-text-muted/50 mb-2"
                          />
                          <p className="text-xs text-text-muted">
                            Drag & drop or{" "}
                            <span className="text-primary font-medium">
                              choose file
                            </span>
                          </p>
                          <p className="text-[10px] text-text-muted/50 mt-1">
                            PNG, JPG up to 5MB · Recommended: 1920×600px
                          </p>
                        </>
                      )}
                      <input
                        id="banner-image-input"
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setBannerImageFile(e.target.files?.[0] || null)
                        }
                        className="hidden"
                      />
                    </div>
                  </div>

                  {!editingBanner && (
                    <div className="sm:col-span-2 flex items-center gap-4 py-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <button
                          type="button"
                          onClick={() =>
                            setBannerForm({
                              ...bannerForm,
                              isActive: !bannerForm.isActive,
                            })
                          }
                          className={`relative w-10 h-5 rounded-full transition-colors ${
                            bannerForm.isActive ? "bg-primary" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform shadow-sm ${
                              bannerForm.isActive
                                ? "translate-x-5"
                                : "translate-x-0"
                            }`}
                          />
                        </button>
                        <span className="text-xs font-medium text-text-muted">
                          Active
                        </span>
                      </label>
                    </div>
                  )}

                  <div className="sm:col-span-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleCloseBannerForm}
                      className="px-4 py-2 bg-surface-light text-text-muted rounded-xl text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-xl transition-all"
                    >
                      <Save size={16} />
                      {editingBanner ? "Update" : "Create"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-sm text-text-muted">
                {banners.length} banner{banners.length !== 1 ? "s" : ""}
              </p>
              {banners.map((banner) => (
                <div
                  key={banner._id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white border border-border"
                >
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="h-20 w-32 object-cover rounded-lg shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {banner.title}{" "}
                      <span className="text-primary">{banner.highlight}</span>
                    </p>
                    <p className="text-xs text-text-muted line-clamp-1">
                      {banner.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${banner.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                      >
                        {banner.isActive ? "Active" : "Inactive"}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        Order: {banner.order}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleEditBanner(banner)}
                      className="p-2 rounded-lg hover:bg-surface-light text-text-muted hover:text-primary transition-all"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteBanner(banner._id)}
                      className="p-2 rounded-lg hover:bg-error/10 text-text-muted hover:text-error transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {banners.length === 0 && (
                <p className="text-center text-text-muted py-12">
                  No banners yet. Add one above.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ========== USERS ========== */}
        {activeTab === "users" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold">Users</h1>
              <p className="text-text-muted text-sm">
                {adminCount} admins · {customerCount} customers
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
              <div className="relative flex-1 w-full sm:max-w-lg">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  type="text"
                  placeholder="Search by name, mobile, or ID..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className={inputClassName + " !pl-10"}
                />
              </div>
              <p className="text-text-muted text-sm shrink-0">
                {filteredUsers.length} of {users.length}
              </p>
            </div>

            <div className="space-y-3">
              {filteredUsers.map((u) => (
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
                          +977 {u.mobile}
                          {" · "}
                          <span
                            className={`font-medium ${u.role === "admin" ? "text-primary" : "text-text-muted"}`}
                          >
                            {u.role}
                          </span>
                          {!u.isActive && (
                            <span className="ml-1 text-error font-medium">
                              · Suspended
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {u.role !== "admin" && (
                        <button
                          onClick={() => handleStartEditUser(u)}
                          className="p-2 rounded-lg hover:bg-surface-light text-text-muted hover:text-text transition-all"
                          title="Edit user"
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                      <button
                        onClick={() =>
                          setExpandedUserId(
                            expandedUserId === u._id ? null : u._id,
                          )
                        }
                        className="p-2 rounded-lg hover:bg-surface-light text-text-muted hover:text-text transition-all"
                        title="Details"
                      >
                        {expandedUserId === u._id ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Edit user inline form */}
                  {editingUserId === u._id && (
                    <div className="px-4 pb-4 border-t border-border">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                        <div>
                          <label className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={editUserForm.name}
                            onChange={(e) =>
                              setEditUserForm({
                                ...editUserForm,
                                name: e.target.value,
                              })
                            }
                            className={inputClassName}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">
                            Role
                          </label>
                          <select
                            value={editUserForm.role}
                            onChange={(e) =>
                              setEditUserForm({
                                ...editUserForm,
                                role: e.target.value,
                              })
                            }
                            className={inputClassName}
                          >
                            <option value="customer">Customer</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">
                            Status
                          </label>
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              type="button"
                              onClick={() =>
                                setEditUserForm({
                                  ...editUserForm,
                                  isActive: !editUserForm.isActive,
                                })
                              }
                              className={`relative w-10 h-5 rounded-full transition-colors ${
                                editUserForm.isActive
                                  ? "bg-primary"
                                  : "bg-gray-300"
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform shadow-sm ${
                                  editUserForm.isActive
                                    ? "translate-x-5"
                                    : "translate-x-0"
                                }`}
                              />
                            </button>
                            <span className="text-xs font-medium text-text-muted">
                              {editUserForm.isActive ? "Active" : "Suspended"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-3">
                        <button
                          onClick={() => setEditingUserId(null)}
                          className="px-3 py-1.5 bg-surface-light text-text-muted rounded-lg text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEditUser(u._id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium"
                        >
                          <Save size={12} />
                          Save
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Expanded details */}
                  {expandedUserId === u._id && editingUserId !== u._id && (
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

        {/* ========== ORDERS ========== */}
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
            highlightPending={highlightPending}
            setHighlightPending={setHighlightPending}
          />
        )}
      </main>
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
const AdminChartsSection = ({ stats, fetchStats }) => {
  const [trendingPeriod, setTrendingPeriod] = useState("monthly");

  const handlePeriodChange = (period) => {
    setTrendingPeriod(period);
    fetchStats(period);
  };

  if (!stats) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white border border-border rounded-2xl p-5 h-75 animate-pulse"
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

  const activeTracking = stats.activeOrderTracking || {};
  const trackingCards = [
    {
      key: "pending",
      label: "Pending",
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      key: "confirmed",
      label: "Confirmed",
      icon: CheckCircle,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      key: "packed",
      label: "Packed",
      icon: Package,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      key: "out_for_delivery",
      label: "Out for Delivery",
      icon: Truck,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  const todayByTime = stats.todayByTime || [];
  const TIME_ICONS = {
    morning: "🌅",
    afternoon: "☀️",
    evening: "🌆",
  };

  return (
    <div className="space-y-6 my-6">
      {/* Active Order Tracking */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Activity size={16} className="text-primary" />
          <h3 className="font-semibold text-sm">Active Order Tracking</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {trackingCards.map((card) => {
            const data = activeTracking[card.key];
            const Icon = card.icon;
            return (
              <div
                key={card.key}
                className="bg-white border border-border rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-lg ${card.bg}`}>
                    <Icon size={14} className={card.color} />
                  </div>
                  <span className="text-xs font-medium text-text-muted">
                    {card.label}
                  </span>
                </div>
                <p className="text-xl font-bold">{data?.count || 0}</p>
                <p className="text-[10px] text-text-muted">
                  Rs.{(data?.amount || 0).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's Orders by Time */}
      <div className="bg-white border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-primary" />
          <h3 className="font-semibold text-sm">Today&apos;s Orders by Time</h3>
          <span className="ml-auto text-[10px] font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
            {todayByTime.reduce((s, t) => s + t.orders, 0)} total
          </span>
        </div>
        {todayByTime.some((t) => t.orders > 0) ? (
          <div className="space-y-2">
            {todayByTime.map((t) => {
              const TIME_LABELS = {
                morning: "Morning (7 AM – 12 PM)",
                afternoon: "Afternoon (12 – 5 PM)",
                evening: "Evening (5 – 9 PM)",
              };
              const maxOrders = Math.max(
                ...todayByTime.map((x) => x.orders),
                1,
              );
              const pct = Math.round((t.orders / maxOrders) * 100);
              return (
                <div key={t.slot} className="rounded-xl bg-surface-light p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{TIME_ICONS[t.slot]}</span>
                      <span className="text-xs font-semibold">
                        {TIME_LABELS[t.slot]}
                      </span>
                    </div>
                    <span className="text-sm font-bold">{t.orders} orders</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full mb-2">
                    <div
                      className="h-2 bg-primary rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-text-muted">
                    <span>💰 Rs.{t.revenue.toLocaleString()}</span>
                    <span>🚚 {t.delivery} delivery</span>
                    <span>🏪 {t.takeaway} pickup</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-text-muted py-8 text-sm">
            No orders today yet
          </p>
        )}
      </div>

      {/* Charts Row 1: Trending Items & Daily Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trending Items with Period Selector */}
        <div className="bg-white border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" />
              <h3 className="font-semibold text-sm">Trending Items</h3>
            </div>
            <div className="flex rounded-lg border border-border overflow-hidden text-[11px]">
              {["daily", "monthly", "yearly"].map((p) => (
                <button
                  key={p}
                  onClick={() => handlePeriodChange(p)}
                  className={`px-2.5 py-1 capitalize transition-colors ${
                    trendingPeriod === p
                      ? "bg-primary text-white"
                      : "bg-white text-text-muted hover:bg-surface-light"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          {(stats.trendingProducts || []).length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={stats.trendingProducts}
                layout="vertical"
                margin={{ left: 10, right: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={90}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white border border-border rounded-xl px-4 py-3 shadow-lg text-sm">
                        <p className="font-semibold">{d.name}</p>
                        <p className="text-xs text-text-muted">
                          Sold: {d.totalSold} {d.unit}
                        </p>
                        <p className="text-xs text-green-600">
                          Revenue: Rs.{d.totalRevenue.toLocaleString()}
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="totalSold"
                  name="Units Sold"
                  fill="#6366f1"
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
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

      {/* Low Stock Products */}
      {(stats.lowStockProducts || []).length > 0 && (
        <div className="bg-white border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-amber-500" />
            <h3 className="font-semibold text-sm">Low Stock Alert</h3>
            <span className="ml-auto text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
              {stats.lowStockProducts.length} items
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {stats.lowStockProducts.map((p) => (
              <div
                key={p._id}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-light"
              >
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                    <Package size={16} className="text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-[10px] text-text-muted">{p.category}</p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={`text-sm font-bold ${
                      p.stock === 0 ? "text-red-600" : "text-amber-600"
                    }`}
                  >
                    {p.stock} {p.unit}
                  </p>
                  <p className="text-[10px] text-text-muted">remaining</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                  <th className="pb-3 pr-4">Mobile</th>
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
                      {item.user?.mobile || "—"}
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
  highlightPending,
  setHighlightPending,
}) => {
  const { stopOrderSound } = useSocket();

  // Auto-clear highlight after 6 seconds
  useEffect(() => {
    if (!highlightPending) return;
    const timer = setTimeout(() => setHighlightPending(false), 6000);
    return () => clearTimeout(timer);
  }, [highlightPending, setHighlightPending]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      if (newStatus === "confirmed") {
        stopOrderSound();
      }
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
        <>
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const config =
                ORDER_STATUS_CONFIG[order.status] ||
                ORDER_STATUS_CONFIG.pending;
              const StatusIcon = config.icon;
              const isExpanded = expandedOrderId === order._id;
              const nextStatus = NEXT_STATUS[order.status];

              return (
                <div
                  key={order._id}
                  className={`rounded-xl bg-white border overflow-hidden transition-all duration-500 ${
                    highlightPending && order.status === "pending"
                      ? "border-red-400 ring-2 ring-red-300 animate-pulse shadow-lg shadow-red-100"
                      : "border-border"
                  }`}
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
                          {order.userId?.name || "Unknown"}
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
                                    {Math.round(discountedPrice)}/
                                    {product?.unit}
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
                          <span className="font-medium text-text">
                            Payment:
                          </span>{" "}
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
        </>
      )}
    </>
  );
};
