import { supabase, adminSupabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface User {
  id: string;
  email: string;
  approved: boolean;
  created_at: string;
}

interface UserFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

const AdminUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("admin_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleApproval = async (userId: string, currentStatus: boolean) => {
    try {
      // Update the admin_profiles table
      const { error: updateError } = await supabase
        .from("admin_profiles")
        .update({ approved: !currentStatus })
        .eq("id", userId);

      if (updateError) throw updateError;

      // Update local state
      setUsers((users) =>
        users.map((user) =>
          user.id === userId ? { ...user, approved: !currentStatus } : user
        )
      );

      toast.success(
        `User ${currentStatus ? "unapproved" : "approved"} successfully`
      );
    } catch (error) {
      console.error("Error toggling approval:", error);
      toast.error("Failed to update user status");
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this admin user?")) {
      return;
    }

    try {
      // Delete from admin_profiles first (due to foreign key constraint)
      const { error: adminError } = await supabase
        .from("admin_profiles")
        .delete()
        .eq("id", userId);

      if (adminError) throw adminError;

      // Delete from users table
      const { error: userError } = await supabase
        .from("users")
        .delete()
        .eq("id", userId);

      if (userError) throw userError;

      // Delete the auth user using the admin client
      const { error: authError } = await adminSupabase.auth.admin.deleteUser(
        userId
      );

      if (authError) throw authError;

      // Update local state
      setUsers((users) => users.filter((user) => user.id !== userId));

      toast.success("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setIsCreating(true);

      // Create the auth user using admin client to ensure proper permissions
      const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create user");

      const userId = authData.user.id;

      try {
        // Create the user record first
        const { error: userError } = await supabase
          .from("users")
          .insert([
            {
              id: userId,
              email: formData.email,
            },
          ]);

        if (userError) throw userError;

        // Then create the admin profile
        const { error: adminError } = await supabase
          .from("admin_profiles")
          .insert([
            {
              id: userId,
              email: formData.email,
              approved: false,
            },
          ]);

        if (adminError) throw adminError;

        toast.success("User created successfully");
        setIsCreating(false);
        setFormData({ email: "", password: "", confirmPassword: "" });
        loadUsers();
      } catch (error) {
        // If there's an error creating the user or admin profile,
        // clean up by deleting the auth user
        const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(
          userId
        );
        if (deleteError) {
          console.error("Error cleaning up auth user:", deleteError);
        }
        throw error;
      }
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(error.message || "Failed to create user");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Manage Admin Users
        </h1>

        <button
          onClick={() => setIsCreating(true)}
          className="btn btn-primary"
        >
          Create New User
        </button>
      </div>

      {/* Create User Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-card rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create New User</h2>
            <form onSubmit={handleCreateUser}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                    className="form-input"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white dark:bg-dark-card rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.approved
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}
                  >
                    {user.approved ? "Approved" : "Pending"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => toggleApproval(user.id, user.approved)}
                    className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                      user.approved
                        ? "text-yellow-700 bg-yellow-100 hover:bg-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50"
                        : "text-green-700 bg-green-100 hover:bg-green-200 dark:text-green-400 dark:bg-green-900/30 dark:hover:bg-green-900/50"
                    } mr-2`}
                  >
                    {user.approved ? "Unapprove" : "Approve"}
                  </button>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 dark:text-red-400 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              No admin users found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;