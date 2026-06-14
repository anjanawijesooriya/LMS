import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Input,
  Switch,
  Dropdown,
  Avatar,
  Form,
  Select,
  notification,
  Modal,
  Upload,
} from "antd";
import {
  CloseOutlined,
  MenuOutlined,
  LoadingOutlined,
  ExclamationCircleOutlined,
  CameraOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { selectAuthState } from "../../redux/features/auth/authSelectors";
import {
  logoutUser,
  editUser,
  deleteUser,
} from "../../redux/features/auth/authActions";
import axiosInstance from "../../utils/axiosInstance";
const axios = axiosInstance;

const { Option } = Select;
const { confirm } = Modal;

const GRADES = [
  "Pre-School",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
  "Grade 13",
];

const Profile = () => {
  const [loader, setLoader] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark",
  );
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const history = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(selectAuthState);
  const [form] = Form.useForm();
  const year = new Date().getFullYear();

  useEffect(() => {
    const t = setTimeout(() => setLoader(false), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const logoutHandler = () => {
    dispatch(logoutUser());
    history("/login");
  };

  const handlePhotoUpload = async (file) => {
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post("/upload?folder=profile-photos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        const response = await dispatch(
          editUser({ id: user?.id, profilePhoto: res.data.url }),
        );
        if (response.success)
          notification.success({ message: "Profile photo updated!" });
      }
    } catch {
      notification.error({
        message: "Failed to upload photo. Please try again.",
      });
    } finally {
      setUploadingPhoto(false);
    }
    return false;
  };

  const handleDeleteAccount = () => {
    confirm({
      title: "Delete your account?",
      icon: <ExclamationCircleOutlined />,
      content:
        "This action is irreversible. All your data will be permanently lost.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        const response = await dispatch(deleteUser(user?.id));
        if (response.success) {
          notification.success({
            message: "Account Deleted",
            description: "Your account has been successfully deleted.",
          });
          setTimeout(() => {
            dispatch(logoutUser());
            history("/login");
          }, 2000);
        } else {
          notification.error({
            message: "Error",
            description: response.message,
          });
        }
      },
    });
  };

  const handleEdit = () => {
    setEditing(true);
    form.setFieldsValue({
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
      grade: user?.grade,
      telephoneNumber: user?.telephoneNumber,
    });
  };

  const handleSave = async (values) => {
    setLoading(true);
    const response = await dispatch(editUser({ ...values, id: user?.id }));
    if (response.success) {
      notification.success({ message: "Profile updated successfully!" });
      setEditing(false);
      setLoading(false);
      setTimeout(() => {
        notification.warning({
          message: "Please log in again to see your changes.",
        });
        setTimeout(() => {
          dispatch(logoutUser());
          history("/login");
        }, 2000);
      }, 2000);
    } else {
      notification.error({ message: "Error", description: response.message });
      setLoading(false);
    }
  };

  const profileMenu = (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3 min-w-[160px]">
      <button
        className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors font-medium"
        onClick={() => history(`/user-profile/${user?.firstName}`)}
      >
        👤 Profile
      </button>
      <button
        className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors font-medium"
        onClick={() => history(`/user-payments/${user?.firstName}`)}
      >
        💳 Payments
      </button>
      <div className="border-t border-slate-200 dark:border-slate-700 my-1" />
      <button
        className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors font-medium"
        onClick={logoutHandler}
      >
        🚪 Logout
      </button>
    </div>
  );

  if (loader) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="font-poppins text-slate-500 dark:text-slate-400 font-medium">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full glass-nav z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex justify-between items-center">
          <h1
            className="font-poppins text-xl font-bold gradient-text cursor-pointer"
            onClick={() => history(`/user-dashboard/${user?.firstName}`)}
          >
            Devians ✦ LMS
          </h1>
          <div className="hidden md:flex items-center gap-3">
            <Switch
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              checkedChildren="🌙"
              unCheckedChildren="☀️"
            />
            <button
              className={`text-sm font-medium px-5 py-2 rounded-xl transition-all duration-300 ${user?.membership?.status === "active" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700" : "btn-primary"}`}
              onClick={() =>
                user?.membership?.status === "active"
                  ? history(`/user-classes/${user?.firstName}`)
                  : history(`/user-enroll/${user?.firstName}`)
              }
            >
              {user?.membership?.status === "active"
                ? "📚 Classes"
                : "🎓 Enroll"}
            </button>
            <Dropdown
              overlay={profileMenu}
              trigger={["click"]}
              placement="bottomRight"
            >
              <div className="relative cursor-pointer">
                <Avatar
                  className="bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-semibold"
                  size={40}
                  src={user?.profilePhoto || undefined}
                >
                  {!user?.profilePhoto &&
                    user?.firstName?.charAt(0).toUpperCase()}
                </Avatar>
                <span
                  className={`absolute -top-0.5 -right-0.5 text-xs leading-none ${user?.membership?.status === "active" ? "text-emerald-500" : "text-amber-500"}`}
                >
                  {user?.membership?.status === "active" ? "✅" : "⏳"}
                </span>
              </div>
            </Dropdown>
          </div>
          <div className="md:hidden">
            <button
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <CloseOutlined /> : <MenuOutlined />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-4 py-4 flex flex-col items-center gap-3"
          >
            <button
              className="w-full text-sm text-slate-700 dark:text-slate-300 py-2"
              onClick={() => history(`/user-profile/${user?.firstName}`)}
            >
              👤 Profile
            </button>
            <button
              className="w-full text-sm text-slate-700 dark:text-slate-300 py-2"
              onClick={() => history(`/user-payments/${user?.firstName}`)}
            >
              💳 Payments
            </button>
            <button
              className="w-full text-sm text-rose-600 py-2"
              onClick={logoutHandler}
            >
              🚪 Logout
            </button>
            <Switch
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              checkedChildren="🌙"
              unCheckedChildren="☀️"
            />
          </motion.div>
        )}
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center pt-24 pb-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg"
        >
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
            {/* Cover banner */}
            <div className="h-28 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 relative overflow-hidden">
              <div className="blob w-32 h-32 bg-white/10 top-0 right-10" />
              <div
                className="blob w-24 h-24 bg-white/10 bottom-0 left-20"
                style={{ animationDelay: "-2s" }}
              />
            </div>

            {/* Profile photo + identity */}
            <div className="px-6 pb-4">
              {/* Avatar row: avatar left, status badge right */}
              <div className="flex items-start justify-between -mt-12 mb-4">
                <div className="relative flex-shrink-0">
                  <Avatar
                    size={96}
                    className="bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-bold text-3xl ring-4 ring-white dark:ring-slate-800"
                    src={user?.profilePhoto || undefined}
                  >
                    {!user?.profilePhoto &&
                      user?.firstName?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Upload
                    beforeUpload={handlePhotoUpload}
                    showUploadList={false}
                    accept="image/*"
                  >
                    <button
                      type="button"
                      className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white text-xs shadow-lg hover:from-indigo-400 hover:to-violet-400 transition-colors"
                    >
                      {uploadingPhoto ? (
                        <LoadingOutlined />
                      ) : (
                        <CameraOutlined />
                      )}
                    </button>
                  </Upload>
                </div>
                {/* Status badge pushed down to clear the banner overlap */}
                <div className="mt-16">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                      user?.membership?.status === "active"
                        ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700"
                        : "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700"
                    }`}
                  >
                    {user?.membership?.status === "active"
                      ? "✅ Active Member"
                      : "⏳ Pending"}
                  </span>
                </div>
              </div>

              {/* Name + Student ID — own full-width row for clarity */}
              <div className="mb-5">
                <h2 className="font-poppins font-bold text-2xl text-slate-900 dark:text-white leading-tight">
                  {user?.firstName} {user?.lastName}
                </h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-slate-400 dark:text-slate-500 text-xs">
                    🪪
                  </span>
                  <span className="text-sm font-mono font-medium text-indigo-600 dark:text-indigo-400 tracking-wide">
                    {user?.studentId || "—"}
                  </span>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: "Email", value: user?.email, icon: "📧" },
                  { label: "Phone", value: user?.telephoneNumber, icon: "📞" },
                  { label: "Grade", value: user?.grade, icon: "🎓" },
                  { label: "Student ID", value: user?.studentId, icon: "🪪" },
                ].map(({ label, value, icon }) => (
                  <div
                    key={label}
                    className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3"
                  >
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                      <span>{icon}</span>
                      <span>{label}</span>
                    </div>
                    <p className="text-slate-800 dark:text-white text-sm font-medium truncate">
                      {value || "—"}
                    </p>
                  </div>
                ))}
              </div>

              {/* Paid months */}
              {user?.membership?.paidMonths?.length > 0 && (() => {
                const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
                const sorted = [...user.membership.paidMonths].sort((a, b) => {
                  const [aM, aY] = a.month.split("-");
                  const [bM, bY] = b.month.split("-");
                  if (aY !== bY) return parseInt(bY) - parseInt(aY);
                  return MONTHS.indexOf(bM) - MONTHS.indexOf(aM);
                });
                return (
                  <div className="mb-4">
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-2">
                      Paid Months
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {sorted.map((pm, i) => (
                        <span
                          key={i}
                          className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium"
                        >
                          ✓ {pm.month}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Actions */}
              <div className="space-y-3">
                {user?.membership?.status === "active" ? (
                  <button
                    className="btn-primary w-full text-sm py-3"
                    onClick={() => history(`/user-classes/${user?.firstName}`)}
                  >
                    📚 View My Classes
                  </button>
                ) : (
                  <button
                    className="btn-outline w-full text-sm py-3"
                    onClick={() => history(`/user-enroll/${user?.firstName}`)}
                  >
                    🎓 Enroll / Pay
                  </button>
                )}

                {editing ? (
                  <Form form={form} onFinish={handleSave} layout="vertical">
                    <div className="grid grid-cols-2 gap-3">
                      <Form.Item
                        label={
                          <span className="text-xs text-slate-600 dark:text-slate-400">
                            First Name
                          </span>
                        }
                        name="firstName"
                        rules={[{ required: true }]}
                      >
                        <Input className="rounded-xl" />
                      </Form.Item>
                      <Form.Item
                        label={
                          <span className="text-xs text-slate-600 dark:text-slate-400">
                            Last Name
                          </span>
                        }
                        name="lastName"
                        rules={[{ required: true }]}
                      >
                        <Input className="rounded-xl" />
                      </Form.Item>
                    </div>
                    <Form.Item
                      label={
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          Email
                        </span>
                      }
                      name="email"
                      rules={[{ required: true, type: "email" }]}
                    >
                      <Input className="rounded-xl" />
                    </Form.Item>
                    <div className="grid grid-cols-2 gap-3">
                      <Form.Item
                        label={
                          <span className="text-xs text-slate-600 dark:text-slate-400">
                            Grade
                          </span>
                        }
                        name="grade"
                        rules={[{ required: true }]}
                      >
                        <Select
                          placeholder="Select Grade"
                          className="rounded-xl"
                        >
                          {GRADES.map((g) => (
                            <Option key={g} value={g}>
                              {g}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        label={
                          <span className="text-xs text-slate-600 dark:text-slate-400">
                            Phone
                          </span>
                        }
                        name="telephoneNumber"
                        rules={[{ required: true }]}
                      >
                        <Input className="rounded-xl" />
                      </Form.Item>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl text-sm disabled:opacity-60"
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-sm"
                        onClick={() => setEditing(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </Form>
                ) : (
                  <div className="flex gap-2">
                    <button
                      className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                      onClick={handleEdit}
                    >
                      ✏️ Edit Profile
                    </button>
                    <button
                      className="flex-1 py-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-semibold rounded-xl text-sm hover:bg-rose-100 dark:hover:bg-rose-900/30 border border-rose-200 dark:border-rose-700 transition-colors"
                      onClick={handleDeleteAccount}
                    >
                      🗑️ Delete Account
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-slate-900 to-slate-950 text-white py-10 px-4 md:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-6">
          <div>
            <div className="font-poppins font-bold gradient-text mb-1">
              Devians LMS
            </div>
            <p className="text-slate-400 text-sm">
              Premier English Learning Platform
            </p>
          </div>
          <div className="text-slate-400 text-sm">
            <p>📧 support@devians.lms</p>
            <p className="mt-1">
              © {year} Devians LMS Platform 🏛️ All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Profile;
