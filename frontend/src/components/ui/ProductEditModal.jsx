import { useState, useEffect } from "react";
import { X, Save, Upload } from "lucide-react";
import { productAPI } from "../../api/productAPI";
import { categoryAPI } from "../../api/categoryAPI";
import toast from "react-hot-toast";

const inputClassName =
  "w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-text text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all";

const ProductEditModal = ({ product, onClose, onSaved }) => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: product.name || "",
    description: product.description || "",
    price: product.price || "",
    discount: product.discount || "",
    category: product.category || "",
    brand: product.brand || "",
    unit: product.unit || "kg",
    stockQuantity: product.stockQuantity || "",
    isAvailable: product.isAvailable ?? true,
    isOrganic: product.isOrganic ?? false,
    isFresh: product.isFresh ?? false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(product.images?.[0] || "");
  const [dragActive, setDragActive] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    categoryAPI
      .getAll()
      .then((res) => setCategories(res.data.data?.categories || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("description", form.description.trim());
    fd.append("price", String(Number(form.price)));
    fd.append("category", form.category.trim());
    fd.append("unit", form.unit);
    fd.append("stockQuantity", String(Number(form.stockQuantity)));
    fd.append("isAvailable", String(form.isAvailable));
    fd.append("isOrganic", String(form.isOrganic));
    fd.append("isFresh", String(form.isFresh));
    if (form.discount !== "") {
      fd.append("discount", String(Number(form.discount)));
    }
    if (form.brand.trim()) {
      fd.append("brand", form.brand.trim());
    }
    if (imageFile) {
      fd.append("image", imageFile);
    }
    try {
      await productAPI.update(product._id, fd);
      toast.success("Product updated");
      onSaved?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Edit Product</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className={inputClassName}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
              className={inputClassName}
            >
              <option value="">Select</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              required
              rows={2}
              className={inputClassName + " resize-none"}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Price
            </label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
              min="0"
              className={inputClassName}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Discount (%)
            </label>
            <input
              type="number"
              value={form.discount}
              onChange={(e) => setForm({ ...form, discount: e.target.value })}
              min="0"
              max="100"
              className={inputClassName}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Stock
            </label>
            <input
              type="number"
              value={form.stockQuantity}
              onChange={(e) =>
                setForm({ ...form, stockQuantity: e.target.value })
              }
              min="0"
              className={inputClassName}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Unit
            </label>
            <select
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className={inputClassName}
            >
              {["kg", "gram", "piece", "pack", "liter"].map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Brand
            </label>
            <input
              type="text"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              className={inputClassName}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Image
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
                  setImageFile(file);
                }
              }}
              onClick={() =>
                document.getElementById("edit-product-image-input").click()
              }
              className={`relative flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-primary/50"
              }`}
            >
              {imageFile || imagePreview ? (
                <div className="relative w-full h-full">
                  <img
                    src={
                      imageFile ? URL.createObjectURL(imageFile) : imagePreview
                    }
                    alt="Preview"
                    className="w-full h-full object-contain rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageFile(null);
                      setImagePreview("");
                    }}
                    className="absolute top-1 right-1 p-1 bg-white/90 rounded-full shadow hover:bg-red-50"
                  >
                    <X size={12} className="text-red-500" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={20} className="text-gray-300 mb-1" />
                  <p className="text-[10px] text-gray-400">
                    Drag & drop or click
                  </p>
                </>
              )}
              <input
                id="edit-product-image-input"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </div>
          </div>

          <div className="col-span-2 flex flex-wrap gap-6 py-1">
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
                  onClick={() => setForm({ ...form, [key]: !form[key] })}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    form[key] ? "bg-primary" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform shadow-sm ${
                      form[key] ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className="text-xs font-medium text-gray-500">
                  {label}
                </span>
              </label>
            ))}
          </div>

          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-500 rounded-xl text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-all"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditModal;
