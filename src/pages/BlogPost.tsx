import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
// import { Tables } from "@/integrations/supabase/types"; // Assuming you have this types file

// type BlogsTable = Tables<"blogs">; // Define a type for your 'blogs' table

interface BlogPost {
  id: string;
  title: string;
  body: string;
  image_url?: string;
  published_at?: string;
}

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("blogs") // No explicit generic type here, rely on client typing
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          throw error;
        }
        setPost((data as unknown as BlogPost) || null);
      } catch (err: any) {
        console.error("Error fetching post:", err);
        setError(err?.message || "Failed to fetch blog post");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (error || !post) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Blog Post Not Found</h1>
          <p>
            The blog post you are looking for does not exist or has been
            removed.
          </p>
          {error && <div className="text-red-500 mt-2">Error: {error}</div>}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-primary">{post.title}</h1>

          <div className="flex items-center mb-6">
            {/* Author and Categories are not directly in Supabase 'blogs' table yet */}
            <div>
              <p className="text-sm text-gray-500">
                {formatDate(post.published_at)}
              </p>
            </div>
          </div>

          {post.image_url && (
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-auto rounded-lg shadow-md mb-8"
            />
          )}
        </header>

        <div className="prose prose-lg max-w-none">
          <p>{post.body}</p>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-2xl font-semibold mb-4">Share this article</h3>
          <div className="flex space-x-4">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                post.title
              )}&url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-600"
            >
              <span className="sr-only">Twitter</span>
              <svg
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                window.location.href
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              <span className="sr-only">Facebook</span>
              <svg
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                window.location.href
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-800 hover:text-blue-900"
            >
              <span className="sr-only">LinkedIn</span>
              <svg
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M19.7 3H4.3A1.3 1.3 0 003 4.3v15.4A1.3 1.3 0 004.3 21h15.4a1.3 1.3 0 001.3-1.3V4.3A1.3 1.3 0 0019.7 3zM8.339 18.338H5.667v-8.59h2.672v8.59zM7.004 8.574a1.548 1.548 0 11-.002-3.096 1.548 1.548 0 01.002 3.096zm11.335 9.764H15.67v-4.177c0-.996-.017-2.278-1.387-2.278-1.389 0-1.601 1.086-1.601 2.206v4.249h-2.667v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.779 3.203 4.092v4.711z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>
      </article>
    </MainLayout>
  );
};

export default BlogPost;
