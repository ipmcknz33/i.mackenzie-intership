import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

import AuthorItems from "../components/author/AuthorItems";

const AUTHOR_API =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/authors";

const FALLBACK_AVATAR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="100%25" height="100%25" fill="%23e9e9ff"/><circle cx="48" cy="40" r="18" fill="%239999ff"/><rect x="18" y="62" width="60" height="22" rx="11" fill="%239999ff"/></svg>';

const getRoot = (payload) => payload?.data ?? payload;

const normalizeAuthor = (payload) => {
  const root = getRoot(payload);
  if (Array.isArray(root)) return root[0] ?? null;
  if (root && typeof root === "object") return root;
  return null;
};

const pickAvatar = (a) =>
  a?.authorImage ||
  a?.authorAvatar ||
  a?.profileImg ||
  a?.profileImage ||
  a?.avatar ||
  a?.image ||
  a?.img ||
  null;

const Author = () => {
  const { authorId } = useParams();

  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function fetchAuthor() {
      setLoading(true);
      try {
        const res = await axios.get(AUTHOR_API, {
          params: { author: String(authorId) },
        });

        const normalized = normalizeAuthor(res.data);

        if (!mounted) return;

        setAuthor(normalized);
        setFollowersCount(Number(normalized?.followers ?? 0));
        setIsFollowing(false);
      } catch {
        if (mounted) {
          setAuthor(null);
          setFollowersCount(0);
          setIsFollowing(false);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (authorId != null && String(authorId).trim() !== "") {
      fetchAuthor();
    } else {
      setAuthor(null);
      setFollowersCount(0);
      setIsFollowing(false);
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [authorId]);

  const resolvedAuthorId = useMemo(() => {
    const v = author?.authorId ?? author?.id ?? author?._id ?? authorId;
    return v == null ? null : String(v);
  }, [author, authorId]);

  const name = author?.authorName ?? author?.name ?? "Unknown";
  const tag = author?.tag ? `@${author.tag}` : author?.username ? `@${author.username}` : "";
  const wallet = author?.address ?? author?.wallet ?? author?.walletAddress ?? "";
  const avatar = pickAvatar(author) || FALLBACK_AVATAR;

  const toggleFollow = () => {
    setIsFollowing((prev) => {
      setFollowersCount((c) => {
        const next = prev ? c - 1 : c + 1;
        return next < 0 ? 0 : next;
      });
      return !prev;
    });
  };

  const copyWallet = async () => {
    if (!wallet) return;
    try {
      await navigator.clipboard.writeText(wallet);
    } catch {}
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 40, paddingBottom: 40 }}>
        <div style={{ opacity: 0.8 }}>Loading author…</div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="container" style={{ paddingTop: 40, paddingBottom: 40 }}>
        <Link to="/explore" style={{ display: "inline-block", marginBottom: 14 }}>
          ← Back to Explore
        </Link>
        <div
          style={{
            border: "1px solid #e6e6f5",
            borderRadius: 10,
            padding: 14,
            background: "#fff",
            maxWidth: 680,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Author not found</div>
          <div style={{ opacity: 0.85 }}>This author ID didn’t return data from the API.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 30, paddingBottom: 50 }}>
      <Link to="/explore" style={{ display: "inline-block", marginBottom: 14 }}>
        ← Back to Explore
      </Link>

      <div className="row" style={{ alignItems: "center", marginBottom: 18 }}>
        <div className="col-lg-8" style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img
            src={avatar}
            alt=""
            style={{ width: 84, height: 84, borderRadius: "50%", objectFit: "cover" }}
          />
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.1 }}>{name}</div>
            {tag ? <div style={{ opacity: 0.75, marginTop: 4 }}>{tag}</div> : null}
            {wallet ? (
              <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ opacity: 0.75, fontSize: 12, wordBreak: "break-all" }}>
                  {wallet}
                </div>
                <button className="btn btn-sm btn-secondary" onClick={copyWallet}>
                  Copy
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="col-lg-4" style={{ textAlign: "right" }}>
          <div style={{ opacity: 0.85, marginBottom: 10 }}>{followersCount} followers</div>
          <button className="btn btn-primary" onClick={toggleFollow}>
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        </div>
      </div>

      {resolvedAuthorId ? <AuthorItems authorId={resolvedAuthorId} authorAvatar={avatar} /> : null}
    </div>
  );
};

export default Author;