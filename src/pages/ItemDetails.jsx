import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

import AuthorImageFallback from "../images/author_thumbnail.jpg";
import NftImageFallback from "../images/nftImage.jpg";

const ITEM_DETAILS_API =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/itemDetails";

const AUTHORS_API =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/authors";

const getRoot = (payload) => payload?.data ?? payload;

const toPersonObject = (p) => {
  if (p == null) return null;
  if (typeof p === "number" || typeof p === "string") return { authorId: p };
  if (typeof p === "object") return p;
  return null;
};

const getPersonId = (p) =>
  p?.authorId ??
  p?.id ??
  p?._id ??
  p?.ownerId ??
  p?.sellerId ??
  p?.creatorId ??
  p?.userId ??
  null;

const getPersonName = (p) =>
  p?.authorName ??
  p?.name ??
  p?.username ??
  p?.tag ??
  p?.handle ??
  p?.ownerName ??
  p?.creatorName ??
  "Unknown";

const getPersonAvatar = (p) =>
  p?.authorImage ??
  p?.profileImg ??
  p?.profileImage ??
  p?.profile_image ??
  p?.avatar ??
  p?.image ??
  p?.img ??
  p?.ownerImage ??
  p?.creatorImage ??
  null;

const normalizeOwners = (item) => {
  const candidates = [
    item?.owners,
    item?.ownerHistory,
    item?.history,
    item?.ownerList,
    item?.ownersList,
  ];

  const arr = candidates.find((x) => Array.isArray(x));
  const raw = Array.isArray(arr) ? arr : [];

  const normalized = raw
    .map((o) => toPersonObject(o))
    .filter(Boolean)
    .map((o) => {
      const id = getPersonId(o);
      const name = getPersonName(o);
      const avatar = getPersonAvatar(o);
      return {
        authorId: id != null ? String(id) : null,
        name,
        avatar: avatar || AuthorImageFallback,
      };
    });

  const seen = new Set();
  const unique = [];
  for (const o of normalized) {
    const key = `${o.authorId ?? "null"}|${o.name}|${o.avatar}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(o);
  }
  return unique;
};

const ItemDetails = () => {
  const { id } = useParams();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    let mounted = true;

    const fetchItem = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(ITEM_DETAILS_API, {
          params: { nftId: id },
        });

        const root = getRoot(data);
        if (!mounted) return;
        setItem(root ?? null);
      } catch {
        if (mounted) setItem(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchItem();
    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    let mounted = true;

    async function fetchAuthors() {
      try {
        const { data } = await axios.get(AUTHORS_API);
        const root = getRoot(data);
        if (!mounted) return;
        setAuthors(Array.isArray(root) ? root : []);
      } catch {
        if (!mounted) return;
        setAuthors([]);
      }
    }

    fetchAuthors();

    return () => {
      mounted = false;
    };
  }, []);

  const authorsById = useMemo(() => {
    const map = new Map();
    for (const a of authors) {
      const key = a?.authorId ?? a?.id ?? a?._id;
      if (key != null) map.set(String(key), a);
    }
    return map;
  }, [authors]);

  const owners = useMemo(() => normalizeOwners(item ?? {}), [item]);
  const firstOwner = owners?.[0] ?? null;

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 40, paddingBottom: 40 }}>
        <div style={{ opacity: 0.85 }}>Loading item...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container" style={{ paddingTop: 40, paddingBottom: 40 }}>
        <Link to="/explore" style={{ display: "inline-block", marginBottom: 14 }}>
          ← Back to Explore
        </Link>

        <div
          style={{
            padding: 16,
            borderRadius: 10,
            background: "#fff",
            border: "1px solid rgba(0,0,0,0.08)",
            maxWidth: 520,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6 }}>NFT not found</div>
          <div style={{ opacity: 0.85 }}>
            This NFT ID didn’t return data from the API.
          </div>
        </div>
      </div>
    );
  }

  const title = item?.title ?? item?.name ?? "Untitled";
  const image =
    item?.nftImage ??
    item?.image ??
    item?.imageUrl ??
    item?.img ??
    NftImageFallback;

  const price =
    item?.price != null ? item.price : item?.nftPrice != null ? item.nftPrice : null;

  const likes = item?.likes ?? item?.favoriteCount ?? item?.favorites ?? 0;

  // Robust owner/creator extraction (covers many API shapes)
  const ownerObj = toPersonObject(
    item?.owner ??
      item?.currentOwner ??
      item?.seller ??
      item?.ownerData ??
      item?.ownerDetails ??
      (item?.ownerId != null || item?.ownerName || item?.ownerImage
        ? { authorId: item?.ownerId, name: item?.ownerName, avatar: item?.ownerImage }
        : null)
  );

  const creatorObj = toPersonObject(
    item?.creator ??
      item?.author ??
      item?.creatorData ??
      item?.creatorDetails ??
      (item?.creatorId != null || item?.creatorName || item?.creatorImage
        ? { authorId: item?.creatorId, name: item?.creatorName, avatar: item?.creatorImage }
        : null)
  );

  // IDs (fallback to first owner in owners list)
  const ownerIdRaw = ownerObj ? getPersonId(ownerObj) : null;
  const creatorIdRaw = creatorObj ? getPersonId(creatorObj) : null;

  const ownerId = ownerIdRaw != null ? String(ownerIdRaw) : firstOwner?.authorId ?? null;
  const creatorId = creatorIdRaw != null ? String(creatorIdRaw) : null;

  // Names (fallback to first owner name)
  const ownerName =
    (ownerObj ? getPersonName(ownerObj) : "Unknown") !== "Unknown"
      ? getPersonName(ownerObj)
      : firstOwner?.name ?? "Unknown";

  const creatorName = creatorObj ? getPersonName(creatorObj) : "Unknown";

  // Avatars: authors api -> object avatar -> owners list avatar -> fallback
  const ownerFromAuthors = ownerId ? authorsById.get(String(ownerId)) : null;
  const creatorFromAuthors = creatorId ? authorsById.get(String(creatorId)) : null;

  const ownerAvatar =
    getPersonAvatar(ownerFromAuthors) ||
    (ownerObj ? getPersonAvatar(ownerObj) : null) ||
    firstOwner?.avatar ||
    AuthorImageFallback;

  const creatorAvatar =
    getPersonAvatar(creatorFromAuthors) ||
    (creatorObj ? getPersonAvatar(creatorObj) : null) ||
    AuthorImageFallback;

  return (
    <div className="container" style={{ paddingTop: 30, paddingBottom: 50 }}>
      <Link to="/explore" style={{ display: "inline-block", marginBottom: 14 }}>
        ← Back to Explore
      </Link>

      <div className="row" style={{ alignItems: "flex-start" }}>
        <div className="col-lg-6" style={{ marginBottom: 20 }}>
          <img
            src={image}
            alt={title}
            style={{ width: "100%", maxWidth: "100%", borderRadius: 10 }}
          />
        </div>

        <div className="col-lg-6">
          <h2 style={{ marginBottom: 10 }}>{title}</h2>

          <div style={{ marginBottom: 10, opacity: 0.85 }}>
            Price: {price != null && price !== "" ? `${price} ETH` : "—"}
          </div>

          <div style={{ marginBottom: 18, opacity: 0.85 }}>Likes: {likes}</div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Owner</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img
                src={ownerAvatar}
                alt=""
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
              {ownerId != null ? (
                <Link to={`/author/${String(ownerId)}`}>{ownerName}</Link>
              ) : (
                <span>{ownerName}</span>
              )}
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Creator</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img
                src={creatorAvatar}
                alt=""
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
              {creatorId != null ? (
                <Link to={`/author/${String(creatorId)}`}>{creatorName}</Link>
              ) : (
                <span>{creatorName}</span>
              )}
            </div>
          </div>

          {owners.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>
                Owners ({owners.length})
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                {owners.map((o, idx) => {
                  const a = o.authorId ? authorsById.get(String(o.authorId)) : null;
                  const avatar = getPersonAvatar(a) || o.avatar || AuthorImageFallback;

                  return (
                    <div
                      key={`${o.authorId ?? "owner"}-${idx}`}
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <img
                        src={avatar}
                        alt=""
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                      {o.authorId ? (
                        <Link to={`/author/${o.authorId}`}>{o.name}</Link>
                      ) : (
                        <span>{o.name}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;