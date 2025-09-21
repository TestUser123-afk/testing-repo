'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Flame, LogOut, Settings, Users, MessageSquare, Plus, ChevronUp, ChevronDown, Trash2, Ban, Volume2, VolumeX, Clock } from 'lucide-react';
import { User, Post as PostType, getCommentCount } from '@/lib/database';
import TOSModal from '@/components/TOSModal';
import UserInfoPopover from '@/components/UserInfoPopover';

interface Category {
  id: number;
  name: string;
  description: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  user_id: number;
  display_name: string;
  username: string;
  category_name: string;
  created_at: string;
  upvotes: number;
  downvotes: number;
  score: number;
}

export default function Home() {
  const { user, login, register, logout, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | 'category' | 'post' | 'admin' | 'userManagement' | 'postManagement' | 'settings' | 'newPost'>('home');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({
    username: '',
    password: '',
    displayName: ''
  });
  const [authError, setAuthError] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allPosts, setAllPosts] = useState<PostType[]>([]);
  const [newPostForm, setNewPostForm] = useState({
    title: '',
    content: '',
    categoryId: ''
  });
  const [settingsForm, setSettingsForm] = useState({
    displayName: user?.displayName || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showTOS, setShowTOS] = useState(false);
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>({});
  const [showSuggestCategoryModal, setShowSuggestCategoryModal] = useState(false);

  useEffect(() => {
    fetchCategories();
    // Check if user has accepted TOS
    const tosAccepted = localStorage.getItem('ember-tos-accepted');
    if (!tosAccepted) {
      setShowTOS(true);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setSettingsForm(prev => ({
        ...prev,
        displayName: user.displayName,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    }
  }, [user]);

  useEffect(() => {
    // Filter categories based on search query
    if (categorySearchQuery.trim() === '') {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
        category.description.toLowerCase().includes(categorySearchQuery.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [categories, categorySearchQuery]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchPostsByCategory = async (categoryId: number) => {
    try {
      const response = await fetch(`/api/posts/category/${categoryId}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
        fetchCommentCounts(data);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (authMode === 'login') {
      const result = await login(authForm.username, authForm.password);
      if (result.success) {
        setShowAuth(false);
        setAuthForm({ username: '', password: '', displayName: '' });
      } else {
        setAuthError(result.error || 'Login failed');
      }
    } else {
      const result = await register(authForm.username, authForm.password, authForm.displayName);
      if (result.success) {
        setAuthMode('login');
        setAuthError('');
        alert('Registration successful! Please log in.');
      } else {
        setAuthError(result.error || 'Registration failed');
      }
    }
  };

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    setCurrentView('category');
    fetchPostsByCategory(category.id);
  };

  const handlePostClick = async (post: Post) => {
    setSelectedPost(post);
    setCurrentView('post');
    await fetchComments(post.id);
  };

  const fetchComments = async (postId: number) => {
    try {
      const response = await fetch(`/api/comments/post/${postId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost || !newComment.trim()) return;

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          postId: selectedPost.id
        })
      });

      if (response.ok) {
        setNewComment('');
        fetchComments(selectedPost.id);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create comment');
      }
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        if (currentView === 'post') {
          setCurrentView('category');
        }
        if (currentView === 'category' && selectedCategory) {
          fetchPostsByCategory(selectedCategory.id);
        }
        if (currentView === 'postManagement') {
          fetchAllPosts();
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        if (selectedPost) {
          fetchComments(selectedPost.id);
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setAllUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchAllPosts = async () => {
    try {
      const response = await fetch('/api/posts');
      if (response.ok) {
        const data = await response.json();
        setAllPosts(data);
      }
    } catch (error) {
      console.error('Failed to fetch all posts:', error);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !newPostForm.title || !newPostForm.content) return;

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPostForm.title,
          content: newPostForm.content,
          categoryId: selectedCategory.id
        })
      });

      if (response.ok) {
        setNewPostForm({ title: '', content: '', categoryId: '' });
        setCurrentView('category');
        fetchPostsByCategory(selectedCategory.id);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create post');
      }
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const handleVote = async (type: 'post' | 'comment', id: number, voteType: number) => {
    try {
      const endpoint = type === 'post' ? `/api/posts/${id}/vote` : `/api/comments/${id}/vote`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType })
      });

      if (response.ok) {
        // Refresh the current view
        if (currentView === 'category' && selectedCategory) {
          fetchPostsByCategory(selectedCategory.id);
        }
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleUpdateDisplayName = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: settingsForm.displayName })
      });

      if (response.ok) {
        alert('Display name updated successfully!');
        // Refresh user data
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update display name');
      }
    } catch (error) {
      console.error('Failed to update display name:', error);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (settingsForm.newPassword !== settingsForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (settingsForm.newPassword.length < 6) {
      alert('New password must be at least 6 characters long');
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: settingsForm.currentPassword,
          newPassword: settingsForm.newPassword
        })
      });

      if (response.ok) {
        alert('Password changed successfully!');
        setSettingsForm(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      alert('Failed to change password');
    }
  };

  const handleTOSAccept = () => {
    localStorage.setItem('ember-tos-accepted', 'true');
    setShowTOS(false);
  };

  const handleDeleteAllPosts = async () => {
    if (!confirm('Are you sure you want to delete ALL posts and comments? This action cannot be undone!')) return;

    try {
      const response = await fetch('/api/admin/delete-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'all' })
      });

      if (response.ok) {
        alert('All posts and comments deleted successfully');
        if (currentView === 'postManagement') {
          fetchAllPosts();
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete posts and comments');
      }
    } catch (error) {
      console.error('Failed to delete all posts:', error);
    }
  };

  const handleDeleteUserAccount = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user account? This action cannot be undone!')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}/delete`, {
        method: 'POST'
      });

      if (response.ok) {
        alert('User account deleted successfully');
        fetchAllUsers();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete user account');
      }
    } catch (error) {
      console.error('Failed to delete user account:', error);
    }
  };

  const fetchCommentCounts = async (posts: Post[]) => {
    const counts: Record<number, number> = {};
    for (const post of posts) {
      try {
        const response = await fetch(`/api/comments/post/${post.id}`);
        if (response.ok) {
          const comments = await response.json();
          counts[post.id] = comments.length;
        }
      } catch (error) {
        console.error('Failed to fetch comment count for post', post.id, error);
      }
    }
    setCommentCounts(counts);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Flame className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading Ember...</p>
        </div>
      </div>
    );
  }

  if (!user && !showAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Flame className="h-16 w-16 text-primary mr-4" />
            <h1 className="text-6xl font-bold fire-text">Ember</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            A blazing hot community forum for passionate discussions
          </p>
          <Button
            onClick={() => setShowAuth(true)}
            className="mr-4"
          >
            Join the Fire
          </Button>
        </div>
      </div>
    );
  }

  if (!user && showAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Flame className="h-8 w-8 text-primary mr-2" />
              <CardTitle className="fire-text">Ember</CardTitle>
            </div>
            <CardDescription>
              {authMode === 'login' ? 'Welcome back to the fire' : 'Join the blazing community'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={authForm.username}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, username: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={authForm.password}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              {authMode === 'register' && (
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={authForm.displayName}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, displayName: e.target.value }))}
                    required
                  />
                </div>
              )}
              {authError && (
                <p className="text-sm text-red-500">{authError}</p>
              )}
              <Button type="submit" className="w-full">
                {authMode === 'login' ? 'Enter the Fire' : 'Ignite Your Account'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login');
                  setAuthError('');
                }}
              >
                {authMode === 'login' ? 'Need an account? Register' : 'Have an account? Login'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setShowAuth(false)}
              >
                Back
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => setCurrentView('home')}
            >
              <Flame className="h-8 w-8 text-primary mr-2" />
              <h1 className="text-2xl font-bold fire-text">Ember</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {user?.displayName}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentView('settings')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              {user?.isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentView('admin')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentView === 'home' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-4">Forum Categories</h2>
              <p className="text-muted-foreground mb-6">Choose a category to start the discussion</p>

              {/* Search bar */}
              <div className="max-w-md mx-auto mb-6">
                <Input
                  type="text"
                  placeholder="Search categories..."
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredCategories.map((category) => (
                <Card
                  key={category.id}
                  className="category-card cursor-pointer hover-flicker"
                  onClick={() => handleCategoryClick(category)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                      {category.name}
                    </CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* Suggest new category button - shows when no search results or always at bottom */}
            {(filteredCategories.length === 0 || categorySearchQuery === '') && (
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => setShowSuggestCategoryModal(true)}
                  className="mb-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Suggest New Category
                </Button>
                {filteredCategories.length === 0 && categorySearchQuery !== '' && (
                  <p className="text-muted-foreground mt-4">
                    No categories found matching "{categorySearchQuery}". Consider suggesting a new category!
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {currentView === 'category' && selectedCategory && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <Button
                  variant="ghost"
                  onClick={() => setCurrentView('home')}
                  className="mb-4"
                >
                  ← Back to Categories
                </Button>
                <h2 className="text-4xl font-bold">{selectedCategory.name}</h2>
                <p className="text-muted-foreground">{selectedCategory.description}</p>
              </div>
              <Button onClick={() => setCurrentView('newPost')}>
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </div>

            <div className="space-y-4">
              {posts.length === 0 ? (
                <Card className="post-card">
                  <CardContent className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No posts yet. Be the first to start the discussion!</p>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <Card key={post.id} className="post-card">
                    <CardContent className="flex gap-4 p-6">
                      <div className="flex flex-col items-center space-y-1 min-w-[60px]">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVote('post', post.id, 1);
                          }}
                          className="h-8 w-8 p-0 hover:bg-green-500/20"
                        >
                          ▲
                        </Button>
                        <span className="text-sm font-semibold text-center">
                          {post.score || 0}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVote('post', post.id, -1);
                          }}
                          className="h-8 w-8 p-0 hover:bg-red-500/20"
                        >
                          ▼
                        </Button>
                      </div>
                      <div
                        className="flex-1 cursor-pointer hover:bg-accent/20 rounded p-2 -m-2 transition-colors"
                        onClick={() => handlePostClick(post)}
                      >
                        <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                        <p className="text-muted-foreground line-clamp-3 mb-3">{post.content}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>By <UserInfoPopover displayName={post.display_name} username={post.username} /></span>
                            <span>•</span>
                            <span>{formatDateTime(post.created_at).date}</span>
                            <span>•</span>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatDateTime(post.created_at).time}</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center space-x-1">
                              <MessageSquare className="h-3 w-3" />
                              <span>{commentCounts[post.id] || 0} comments</span>
                            </div>
                          </div>
                          {(user?.isAdmin || user?.id === post.user_id) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePost(post.id);
                              }}
                              className="text-red-500 hover:text-red-700 hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {currentView === 'admin' && user?.isAdmin && (
          <div>
            <h2 className="text-4xl font-bold mb-8">Admin Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
                setCurrentView('userManagement');
                fetchAllUsers();
              }}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    User Management
                  </CardTitle>
                  <CardDescription>View and manage all users</CardDescription>
                </CardHeader>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
                setCurrentView('postManagement');
                fetchAllPosts();
              }}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                    Post Management
                  </CardTitle>
                  <CardDescription>View and moderate all posts</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        )}

        {currentView === 'userManagement' && user?.isAdmin && (
          <div>
            <Button
              variant="ghost"
              onClick={() => setCurrentView('admin')}
              className="mb-4"
            >
              ← Back to Admin Dashboard
            </Button>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-bold">User Management</h2>
              <Button
                variant="destructive"
                onClick={handleDeleteAllPosts}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All Posts & Comments
              </Button>
            </div>
            <div className="space-y-4">
              {allUsers.map((user) => (
                <Card key={user.id}>
                  <CardContent className="flex items-center justify-between p-6">
                    <div>
                      <h3 className="font-semibold">
                        <UserInfoPopover displayName={user.display_name} username={user.username} />
                      </h3>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                      <p className="text-sm text-muted-foreground">
                        Joined: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                      {user.ip_address && (
                        <p className="text-sm text-muted-foreground">
                          IP: {user.ip_address}
                        </p>
                      )}
                      {user.is_banned && <span className="text-red-500 text-sm">BANNED</span>}
                      {user.is_muted && <span className="text-orange-500 text-sm">MUTED</span>}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          const action = user.is_banned ? 'unban' : 'ban';
                          const response = await fetch(`/api/admin/users/${user.id}/ban`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action })
                          });
                          if (response.ok) fetchAllUsers();
                        }}
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        {user.is_banned ? 'Unban' : 'Ban'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          const action = user.is_muted ? 'unmute' : 'mute';
                          const response = await fetch(`/api/admin/users/${user.id}/mute`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action })
                          });
                          if (response.ok) fetchAllUsers();
                        }}
                      >
                        {user.is_muted ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}
                        {user.is_muted ? 'Unmute' : 'Mute'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUserAccount(user.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {currentView === 'postManagement' && user?.isAdmin && (
          <div>
            <Button
              variant="ghost"
              onClick={() => setCurrentView('admin')}
              className="mb-4"
            >
              ← Back to Admin Dashboard
            </Button>
            <h2 className="text-4xl font-bold mb-8">Post Management</h2>
            <div className="space-y-4">
              {allPosts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{post.title}</h3>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                          <span>By <UserInfoPopover displayName={post.display_name} username={post.username} /> in {post.category_name}</span>
                          <span>•</span>
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                        <p className="text-muted-foreground line-clamp-2">{post.content}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Score: {post.score || 0} ({post.upvotes || 0} ↑ {post.downvotes || 0} ↓)
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={async () => {
                          if (confirm('Are you sure you want to delete this post?')) {
                            const response = await fetch(`/api/posts/${post.id}`, {
                              method: 'DELETE'
                            });
                            if (response.ok) fetchAllPosts();
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {currentView === 'settings' && (
          <div>
            <h2 className="text-4xl font-bold mb-8">Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
              {/* Profile Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>Update your display name</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateDisplayName} className="space-y-4">
                    <div>
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={settingsForm.displayName}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, displayName: e.target.value }))}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Update Display Name
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Password Change */}
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your account password</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={settingsForm.currentPassword}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={settingsForm.newPassword}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        required
                        minLength={6}
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={settingsForm.confirmPassword}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                        minLength={6}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Change Password
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {currentView === 'post' && selectedPost && (
          <div>
            <Button
              variant="ghost"
              onClick={() => setCurrentView('category')}
              className="mb-4"
            >
              ← Back to {selectedCategory?.name}
            </Button>

            {/* Post Content */}
            <Card className="post-card mb-6">
              <CardContent className="flex gap-4 p-6">
                <div className="flex flex-col items-center space-y-1 min-w-[60px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote('post', selectedPost.id, 1)}
                    className="h-8 w-8 p-0 hover:bg-green-500/20"
                  >
                    ▲
                  </Button>
                  <span className="text-sm font-semibold text-center">
                    {selectedPost.score || 0}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote('post', selectedPost.id, -1)}
                    className="h-8 w-8 p-0 hover:bg-red-500/20"
                  >
                    ▼
                  </Button>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold mb-4">{selectedPost.title}</h1>
                      <p className="text-muted-foreground mb-4 whitespace-pre-wrap">{selectedPost.content}</p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>By <UserInfoPopover displayName={selectedPost.display_name} username={selectedPost.username} /></span>
                        <span>•</span>
                        <span>{formatDateTime(selectedPost.created_at).date}</span>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDateTime(selectedPost.created_at).time}</span>
                        </div>
                      </div>
                    </div>
                    {(user?.isAdmin || user?.id === selectedPost.user_id) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePost(selectedPost.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Post
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* New Comment Form */}
            {user && !user.isMuted && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Add a Comment</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateComment} className="space-y-4">
                    <textarea
                      className="w-full h-24 p-3 border border-border rounded-md bg-background"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts..."
                      required
                    />
                    <Button type="submit">Post Comment</Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Comments */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Comments ({comments.length})</h2>
              {comments.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
                  </CardContent>
                </Card>
              ) : (
                comments.map((comment) => (
                  <Card key={comment.id} className="comment-card">
                    <CardContent className="flex gap-4 p-4">
                      <div className="flex flex-col items-center space-y-1 min-w-[50px]">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVote('comment', comment.id, 1)}
                          className="h-6 w-6 p-0 hover:bg-green-500/20 text-xs"
                        >
                          ▲
                        </Button>
                        <span className="text-xs font-semibold text-center">
                          {comment.score || 0}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVote('comment', comment.id, -1)}
                          className="h-6 w-6 p-0 hover:bg-red-500/20 text-xs"
                        >
                          ▼
                        </Button>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="mb-2 whitespace-pre-wrap">{comment.content}</p>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <span>By <UserInfoPopover displayName={comment.display_name} username={comment.username} /></span>
                              <span>•</span>
                              <span>{formatDateTime(comment.created_at).date}</span>
                              <span>•</span>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatDateTime(comment.created_at).time}</span>
                              </div>
                            </div>
                          </div>
                          {(user?.isAdmin || user?.id === comment.user_id) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {currentView === 'newPost' && selectedCategory && (
          <div>
            <Button
              variant="ghost"
              onClick={() => setCurrentView('category')}
              className="mb-4"
            >
              ← Back to {selectedCategory.name}
            </Button>
            <h2 className="text-4xl font-bold mb-8">Create New Post in {selectedCategory.name}</h2>
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle>New Post</CardTitle>
                <CardDescription>Share your thoughts with the community</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreatePost} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Post Title</Label>
                    <Input
                      id="title"
                      value={newPostForm.title}
                      onChange={(e) => setNewPostForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter a compelling title..."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <textarea
                      id="content"
                      className="w-full h-32 p-3 border border-border rounded-md bg-background"
                      value={newPostForm.content}
                      onChange={(e) => setNewPostForm(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Share your thoughts..."
                      required
                    />
                  </div>
                  <div className="flex space-x-4">
                    <Button type="submit" className="flex-1">
                      Create Post
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentView('category')}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Suggest Category Modal */}
      {showSuggestCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Suggest a New Category</h3>
            <p className="text-muted-foreground mb-4">
              Help us improve the forum by suggesting a new category! Fill out this form and our team will review your suggestion.
            </p>
            <iframe
              src="https://forms.cloud.microsoft/r/Zpq54BvbRN"
              width="100%"
              height="500"
              frameBorder="0"
              marginHeight={0}
              marginWidth={0}
              className="rounded border"
              title="Suggest New Category Form"
            >
              Loading form...
            </iframe>
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => setShowSuggestCategoryModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <TOSModal isOpen={showTOS} onAccept={handleTOSAccept} />
    </div>
  );
}
