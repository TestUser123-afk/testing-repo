'use client';

import { useState, useEffect } from 'react';
import { User, Trophy } from 'lucide-react';

interface UserInfoPopoverProps {
  displayName: string | undefined;
  username: string | undefined;
  className?: string;
}

interface UserInfo {
  social_credit_score: number;
  created_at: string;
}

export default function UserInfoPopover({ displayName, username, className = '' }: UserInfoPopoverProps) {
  const [showPopover, setShowPopover] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);

  // Don't render if we don't have the required data
  if (!displayName || !username) {
    return <span className={className}>{displayName || 'Unknown User'}</span>;
  }

  const fetchUserInfo = async () => {
    if (!username || userInfo) return; // Don't fetch if we already have data

    setLoading(true);
    try {
      const response = await fetch(`/api/profile/${username}`);
      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    setPopoverPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });

    setShowPopover(true);
    fetchUserInfo();

    // Auto-hide after 5 seconds
    setTimeout(() => {
      setShowPopover(false);
    }, 5000);
  };

  const handleMouseLeave = () => {
    // Small delay before hiding to allow mouse to move to popover
    setTimeout(() => {
      setShowPopover(false);
    }, 200);
  };

  const getSocialCreditColor = (score: number) => {
    if (score >= 100) return 'text-green-500';
    if (score >= 50) return 'text-blue-500';
    if (score >= 0) return 'text-gray-500';
    if (score >= -50) return 'text-orange-500';
    return 'text-red-500';
  };

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <>
      <span
        onClick={handleClick}
        className={`cursor-pointer hover:underline hover:text-primary transition-colors ${className}`}
        title="Click to see user info"
      >
        {displayName}
      </span>

      {showPopover && (
        <>
          {/* Backdrop to close popover */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPopover(false)}
          />

          {/* Popover */}
          <div
            className="fixed z-50 bg-card border border-border rounded-lg shadow-lg p-3 min-w-[220px]"
            style={{
              left: `${popoverPosition.x}px`,
              top: `${popoverPosition.y}px`,
              transform: 'translate(-50%, -100%)'
            }}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-start space-x-2">
              <User className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground">@{username}</p>

                {loading ? (
                  <p className="text-xs text-muted-foreground mt-1">Loading...</p>
                ) : userInfo ? (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center space-x-1">
                      <Trophy className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Social Credit Score:</span>
                      <span className={`text-xs font-medium ${getSocialCreditColor(userInfo.social_credit_score)}`}>
                        {userInfo.social_credit_score}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Joined {formatJoinDate(userInfo.created_at)}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Arrow pointing down */}
            <div
              className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-border"
            />
            <div
              className="absolute top-full left-1/2 transform -translate-x-1/2 translate-y-[-1px] w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-card"
            />
          </div>
        </>
      )}
    </>
  );
}
