import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import AOS from "aos";

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
  p?.ownerName ??
  p?.creatorName ??
  p?.name ??
  p?.username ??
  p?.tag ??
  p?.handle ??
  "Unknown";

const getPersonAvatar = (p) =>
  p?.authorImage ??
  p?.ownerImage ??
  p?.creatorImage ??
  p?.profileImg ??
  p?.profileImage ??
  p?.avatar ??
  p?.image ??
  p?.img ??
  p?.pfp ??
  p?.photo ??
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

  useEffect(() => {
    if (loading) return;
    const t = setTimeout(() => {
      AOS.refreshHard();
    }, 50);
    return () => clearTimeout(t);
  }, [loading, item]);

  const authorsById = useMemo(() => {
    const map = new Map();
    for (const a of authors) {
      const key = a?.authorId ?? a?.id ?? a?._id;
      if (key != null) map.set(String(key), a);
    }
    return map;
  }, [authors]);

  const owners = useMemo(() => normalizeOwners(item ?? {}), [item]);

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
        <Link
          to="/explore"
          style={{ display: "inline-block", marginBottom: 14 }}
        >
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
  const tag = item?.tag ?? item?.tagId ?? item?.tokenId ?? null;
  const tagText = tag != null && `${tag}` !== "" ? ` #${tag}` : "";

  const image =
    item?.nftImage ??
    item?.image ??
    item?.imageUrl ??
    item?.img ??
    NftImageFallback;

  const description =
    item?.description ?? item?.desc ?? item?.details ?? item?.about ?? "";

  const price =
    item?.price != null
      ? item.price
      : item?.nftPrice != null
        ? item.nftPrice
        : null;

  const likes = item?.likes ?? item?.favoriteCount ?? item?.favorites ?? 0;
  const views = item?.views ?? item?.viewCount ?? item?.seen ?? 0;

  const ownerObj =
    toPersonObject(item?.owner ?? item?.ownerData ?? null) ??
    (item?.ownerId != null ||
    item?.ownerName ||
    item?.ownerImage ||
    item?.ownerAvatar
      ? {
          authorId: item?.ownerId ?? null,
          ownerName: item?.ownerName ?? null,
          ownerImage:
            item?.ownerImage ?? item?.ownerAvatar ?? item?.ownerImg ?? null,
        }
      : null) ??
    (owners[0]
      ? {
          authorId: owners[0].authorId,
          name: owners[0].name,
          avatar: owners[0].avatar,
        }
      : null);

  const creatorObj =
    toPersonObject(item?.creator ?? item?.creatorData ?? null) ??
    (item?.creatorId != null ||
    item?.creatorName ||
    item?.creatorImage ||
    item?.creatorAvatar
      ? {
          authorId: item?.creatorId ?? null,
          creatorName: item?.creatorName ?? null,
          creatorImage:
            item?.creatorImage ??
            item?.creatorAvatar ??
            item?.creatorImg ??
            null,
        }
      : null);

  const ownerIdRaw = ownerObj ? getPersonId(ownerObj) : null;
  const creatorIdRaw = creatorObj ? getPersonId(creatorObj) : null;

  const ownerId = ownerIdRaw != null ? String(ownerIdRaw) : null;
  const creatorId = creatorIdRaw != null ? String(creatorIdRaw) : null;

  const ownerFromAuthors = ownerId ? authorsById.get(ownerId) : null;
  const creatorFromAuthors = creatorId ? authorsById.get(creatorId) : null;

  const ownerName =
    (ownerFromAuthors ? getPersonName(ownerFromAuthors) : null) ??
    (ownerObj ? getPersonName(ownerObj) : "Unknown");

  const creatorName =
    (creatorFromAuthors ? getPersonName(creatorFromAuthors) : null) ??
    (creatorObj ? getPersonName(creatorObj) : "Unknown");

  const ownerAvatar =
    (ownerFromAuthors ? getPersonAvatar(ownerFromAuthors) : null) ||
    (ownerObj ? getPersonAvatar(ownerObj) : null) ||
    AuthorImageFallback;

  const creatorAvatar =
    (creatorFromAuthors ? getPersonAvatar(creatorFromAuthors) : null) ||
    (creatorObj ? getPersonAvatar(creatorObj) : null) ||
    AuthorImageFallback;

  const hasPrice =
    price != null && `${price}` !== "" && !Number.isNaN(Number(price));
  const priceText = hasPrice ? Number(price).toFixed(2) : "—";

  return (
    <div className="container" style={{ paddingTop: 30, paddingBottom: 50 }}>
      <Link to="/explore" style={{ display: "inline-block", marginBottom: 14 }}>
        ← Back to Explore
      </Link>

      <div className="row" style={{ alignItems: "flex-start" }}>
        <div className="col-lg-6" style={{ marginBottom: 20 }}>
          <img
            data-aos="zoom-in"
            src={image}
            alt={title}
            style={{ width: "100%", maxWidth: "100%", borderRadius: 10 }}
          />
        </div>

        <div className="col-lg-6">
          <h2 data-aos="fade-up" style={{ marginBottom: 10 }}>
            {title}
            {tagText}
          </h2>

          <div
            data-aos="fade-up"
            style={{ display: "flex", gap: 10, marginBottom: 15 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "#f3f3f3",
                padding: "5px 12px",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              <i className="fa fa-eye" />
              {views}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "#f3f3f3",
                padding: "5px 12px",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              <i className="fa fa-heart" />
              {likes}
            </div>
          </div>

          {description ? (
            <div
              data-aos="fade-up"
              style={{ marginBottom: 14, opacity: 0.85, lineHeight: 1.5 }}
            >
              {description}
            </div>
          ) : null}

          <div data-aos="fade-up" style={{ marginBottom: 18 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Price</div>
            <div className="itemDetails__priceRow">
              <span className="itemDetails__priceValue">{priceText}</span>
            </div>
          </div>

          <div data-aos="fade-up" style={{ marginBottom: 18 }}>
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
              {ownerId ? (
                <Link to={`/author/${ownerId}`}>{ownerName}</Link>
              ) : (
                <span>{ownerName}</span>
              )}
            </div>
          </div>

          <div data-aos="fade-up" style={{ marginBottom: 18 }}>
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
              {creatorId ? (
                <Link to={`/author/${creatorId}`}>{creatorName}</Link>
              ) : (
                <span>{creatorName}</span>
              )}
            </div>
          </div>

          {owners.length > 0 ? (
            <div data-aos="fade-up" style={{ marginTop: 18 }}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>
                Owners ({owners.length})
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                {owners.map((o, idx) => (
                  <div
                    key={`${o.authorId ?? "owner"}-${idx}`}
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <img
                      src={o.avatar || AuthorImageFallback}
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
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
