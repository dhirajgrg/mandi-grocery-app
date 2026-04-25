import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { User, Phone, Settings, Shield } from "lucide-react";

const ProfilePage = () => {
  const { user, isAdmin } = useAuth();

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      {/* User Info */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
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
          </div>
          <div>
            <h2 className="text-lg font-bold">{user?.name}</h2>
            <p className="text-sm text-text-muted">+977 {user?.mobile}</p>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <Shield size={12} />
                Admin
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 px-4 py-3 bg-surface-light rounded-xl">
            <User size={18} className="text-text-muted shrink-0" />
            <div>
              <p className="text-xs text-text-muted">Full Name</p>
              <p className="text-sm font-medium">{user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 bg-surface-light rounded-xl">
            <Phone size={18} className="text-text-muted shrink-0" />
            <div>
              <p className="text-xs text-text-muted">Mobile (+977)</p>
              <p className="text-sm font-medium">{user?.mobile}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Go to Settings */}
      <Link
        to="/settings"
        className="flex items-center gap-3 px-5 py-4 bg-white rounded-2xl border border-border hover:bg-surface-light transition-colors"
      >
        <Settings size={18} className="text-text-muted" />
        <div>
          <p className="text-sm font-medium">Settings</p>
          <p className="text-xs text-text-muted">
            Edit name, profile picture, change password
          </p>
        </div>
      </Link>
    </div>
  );
};

export default ProfilePage;
