import { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../api/authAPI";
import toast from "react-hot-toast";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Camera,
  Loader2,
  Pencil,
  Check,
  X,
  Phone,
  ShieldCheck,
} from "lucide-react";

const SettingsPage = () => {
  const { user, setUser } = useAuth();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [remainingResends, setRemainingResends] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const [savingName, setSavingName] = useState(false);
  const fileInputRef = useRef(null);

  const handleNameSave = async () => {
    if (!newName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    if (newName.trim() === user?.name) {
      setEditingName(false);
      return;
    }
    setSavingName(true);
    try {
      const res = await authAPI.updateName({ name: newName.trim() });
      const updatedUser = res.data.data || res.data;
      setUser((prev) => ({ ...prev, name: updatedUser.name }));
      toast.success("Name updated!");
      setEditingName(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update name");
    } finally {
      setSavingName(false);
    }
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("profilePic", file);
      const res = await authAPI.uploadProfilePic(formData);
      const updatedUser = res.data.data || res.data;
      setUser((prev) => ({ ...prev, profilePic: updatedUser.profilePic }));
      toast.success("Profile picture updated!");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to upload profile picture",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSendOtp = async () => {
    setSendingOtp(true);
    try {
      const res = await authAPI.sendChangePasswordOtp();
      const remaining = res.data?.data?.remainingResends;
      if (remaining !== undefined) setRemainingResends(remaining);
      toast.success("OTP sent to your mobile number");
      setOtpSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await authAPI.changePassword({
        otp,
        newPassword: passwordForm.newPassword,
        confirmNewPassword: passwordForm.confirmNewPassword,
      });
      toast.success("Password changed successfully!");
      setPasswordForm({ newPassword: "", confirmNewPassword: "" });
      setOtp("");
      setOtpSent(false);
      setOtpVerified(false);
      setShowPasswordForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const resetPasswordFlow = () => {
    setShowPasswordForm(false);
    setOtpSent(false);
    setOtpVerified(false);
    setOtp("");
    setRemainingResends(null);
    setPasswordForm({ newPassword: "", confirmNewPassword: "" });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Profile Picture & Name */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative group">
            {user?.profilePic ? (
              <img
                src={user.profilePic}
                alt={user.name}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera size={18} className="text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePicUpload}
              className="hidden"
            />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold">{user?.name}</h2>
            <p className="text-sm text-text-muted">+977 {user?.mobile}</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Editable Name */}
          <div className="relative flex items-center gap-3 px-4 py-3 bg-surface-light rounded-xl">
            <User size={18} className="text-text-muted shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-muted">Full Name</p>
              {editingName ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    autoFocus
                    className="flex-1 px-2 py-1 text-sm font-medium rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                  <button
                    onClick={handleNameSave}
                    disabled={savingName}
                    className="p-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    {savingName ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Check size={16} />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setEditingName(false);
                      setNewName(user?.name || "");
                    }}
                    className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <p className="text-sm font-medium">{user?.name}</p>
              )}
            </div>
            {!editingName && (
              <button
                onClick={() => {
                  setNewName(user?.name || "");
                  setEditingName(true);
                }}
                className="absolute top-2 right-2 p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                <Pencil size={14} />
              </button>
            )}
          </div>

          {/* Mobile (read-only) */}
          <div className="flex items-center gap-3 px-4 py-3 bg-surface-light rounded-xl">
            <Phone size={18} className="text-text-muted shrink-0" />
            <div>
              <p className="text-xs text-text-muted">Mobile (+977)</p>
              <p className="text-sm font-medium">{user?.mobile}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lock size={18} />
            <h2 className="font-bold">Change Password</h2>
          </div>
          {!showPasswordForm && (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              Change
            </button>
          )}
        </div>

        {showPasswordForm && (
          <div className="space-y-4">
            {/* Step 1: Send OTP */}
            {!otpSent && (
              <div className="space-y-3">
                <p className="text-sm text-text-muted">
                  We'll send a verification OTP to your mobile number (+977{" "}
                  {user?.mobile}) to confirm it's you.
                </p>
                <button
                  onClick={handleSendOtp}
                  disabled={sendingOtp}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-all"
                >
                  {sendingOtp ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      Send OTP
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Step 2: Enter OTP + New Password */}
            {otpSent && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="6-digit OTP"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-light border border-border focus:outline-none focus:ring-2 focus:ring-black/10 tracking-widest text-center font-mono text-lg"
                  />
                  <p className="text-xs text-text-muted mt-1">
                    OTP sent to +977 {user?.mobile}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-light border border-border text-sm focus:outline-none focus:ring-2 focus:ring-black/10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                    >
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmNewPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmNewPassword: e.target.value,
                      })
                    }
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-light border border-border text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-all"
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                  <button
                    type="button"
                    onClick={resetPasswordFlow}
                    className="px-5 py-2.5 bg-surface-light text-sm font-semibold rounded-xl hover:bg-surface-lighter transition-all"
                  >
                    Cancel
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || remainingResends === 0}
                  className="text-xs text-primary hover:text-primary-dark font-medium transition-colors disabled:opacity-50"
                >
                  {sendingOtp
                    ? "Sending..."
                    : remainingResends !== null
                      ? `Resend OTP (${remainingResends} left)`
                      : "Resend OTP"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
