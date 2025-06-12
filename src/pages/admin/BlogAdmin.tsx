import { useEffect, useState, useRef } from "react";
import { Plus, Loader2, Trash2, Edit } from "lucide-react";
import PageTransition from "@/components/layout/PageTransition";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface BlogPost {
  id: string;
  title: string;
  body: string;
  image_url?: string;
  published_at?: string;
}

const BlogAdmin = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", imageUrl: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [blogToDeleteId, setBlogToDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      setError(error.message);
    } else {
      setBlogs(data as BlogPost[]);
    }
    setLoading(false);
  };

  // Upload image to Supabase Storage
  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from("blog-images")
      .upload(fileName, file, { upsert: true });
    if (error) {
      setError(error.message);
      return null;
    }
    const { publicUrl } = supabase.storage
      .from("blog-images")
      .getPublicUrl(data.path);
    return publicUrl;
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    let imageUrl = form.imageUrl;

    if (
      fileInputRef.current &&
      fileInputRef.current.files &&
      fileInputRef.current.files[0]
    ) {
      const uploadedUrl = await uploadImage(fileInputRef.current.files[0]);
      if (uploadedUrl) imageUrl = uploadedUrl;
    } else if (
      editingPost &&
      !form.imageUrl &&
      !fileInputRef.current?.files?.length
    ) {
      // If editing and no new image/link is provided, keep the existing image
      imageUrl = editingPost.image_url || "";
    }

    console.log("Final imageUrl before DB operation:", imageUrl);

    if (editingPost) {
      // Update existing post
      const { error } = await supabase
        .from("blogs")
        .update({
          title: form.title,
          body: form.body,
          image_url: imageUrl,
        })
        .eq("id", editingPost.id);
      if (error) setError(error.message);
    } else {
      // Create new post
      const { error } = await supabase.from("blogs").insert([
        {
          title: form.title,
          body: form.body,
          image_url: imageUrl,
          published_at: new Date().toISOString(),
        },
      ]);
      if (error) setError(error.message);
    }

    setSubmitting(false);
    setShowForm(false);
    setEditingPost(null); // Clear editing state
    setForm({ title: "", body: "", imageUrl: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
    fetchBlogs();
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setForm({
      title: post.title,
      body: post.body,
      imageUrl: post.image_url || "",
    });
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingPost(null);
    setForm({ title: "", body: "", imageUrl: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = (id: string) => {
    setBlogToDeleteId(id);
    setShowDeleteConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!blogToDeleteId) return;
    setError(null);
    const { error } = await supabase
      .from("blogs")
      .delete()
      .eq("id", blogToDeleteId);
    if (error) setError(error.message);
    setShowDeleteConfirmModal(false);
    setBlogToDeleteId(null);
    fetchBlogs();
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[url('/admin-bg.jpg')] bg-cover bg-center bg-no-repeat bg-fixed space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
            onClick={() => {
              setShowForm((v) => !v);
              setEditingPost(null);
              setForm({ title: "", body: "", imageUrl: "" });
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
          >
            <Plus size={20} className="mr-2" />
            {showForm ? "Cancel" : "New Blog Post"}
          </motion.button>
        </div>
        {showForm && (
          <form
            onSubmit={handleCreateOrUpdate}
            className="bg-white rounded-lg shadow p-6 space-y-4"
          >
            <h2 className="text-xl font-bold mb-4">
              {editingPost ? "Edit Blog Post" : "Create New Blog Post"}
            </h2>
            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-lg border-gray-300 shadow focus:border-blue-500 focus:ring-blue-500"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Image (Upload or Paste Link)
              </label>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-2"
              />
              <input
                type="url"
                placeholder="Or paste image link here"
                className="mt-1 block w-full rounded-lg border-gray-300 shadow focus:border-blue-500 focus:ring-blue-500"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              />
              {form.imageUrl && ( // Show current image if editing and there's an image
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Current Image:</p>
                  <img
                    src={form.imageUrl}
                    alt="Current"
                    className="h-24 w-24 object-cover rounded-md mt-1"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Body
              </label>
              <textarea
                required
                rows={5}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow focus:border-blue-500 focus:ring-blue-500"
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelForm}
                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 border border-transparent rounded-lg shadow text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition"
              >
                {submitting
                  ? editingPost
                    ? "Updating..."
                    : "Posting..."
                  : editingPost
                  ? "Update Blog"
                  : "Post Blog"}
              </button>
            </div>
          </form>
        )}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No blog posts found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <motion.div
                key={blog.id}
                className="bg-white rounded-lg shadow p-4 flex flex-col relative"
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {blog.image_url && (
                  <img
                    src={blog.image_url}
                    alt={blog.title}
                    className="h-40 w-full object-cover rounded mb-3"
                  />
                )}
                <h2 className="text-lg font-semibold mb-1">{blog.title}</h2>
                <div className="text-xs text-gray-500 mb-2">
                  {blog.published_at
                    ? new Date(blog.published_at).toLocaleDateString()
                    : ""}
                </div>
                <div className="text-gray-700 text-sm line-clamp-3 mb-2">
                  {blog.body}
                </div>
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    className="text-blue-500 hover:text-blue-700"
                    onClick={() => handleEdit(blog)}
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDelete(blog.id)}
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-auto"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirm Deletion
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this blog post? This action
                cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirmModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default BlogAdmin;
