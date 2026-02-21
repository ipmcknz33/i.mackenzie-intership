import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import AuthorImageFallback from "../../images/author_thumbnail.jpg";
import NftImageFallback from "../../images/nftImage.jpg";

const AUTHOR_API =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/authors";

const getRoot = (data) => data?.data ?? data;

const pickArray = (root) => {
  const candidates = [
    root?.nftCollection,
    root?.nfts,
    root?.items,
    root?.collection,
  ];
  const arr = candidates.find(Array.isArray);
  return Array.isArray(arr) ? arr : [];
};

const getNftId = (item) =>
  item?.id ?? item?._id ?? item?.nftId ?? item?.tokenId ?? null;
const getTitle = (item) => item?.title ?? item?.name ?? "Untitled";
const getImage = (item) =>
  item?.nftImage ??
  item?.image ??
  item?.imageUrl ??
  item?.img ??
  NftImageFallback;

const getPriceText = (item) => {
  const price =
    item?.price != null
      ? item.price
      : item?.nftPrice != null
        ? item.nftPrice
        : null;
  return price != null && price !== "" ? `${price} ETH` : "—";
};

const getLikes = (item) =>
  item?.likes ?? item?.favoriteCount ?? item?.favorites ?? 0;

const formatFromSeconds = (seconds) => {
  const s = Math.max(0, Math.floor(seconds));
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (days > 0) return `${days}d ${hours}h ${mins}m ${secs}s`;
  return `${hours}h ${mins}m ${secs}s`;
};

const formatFromMs = (ms) => formatFromSeconds(ms / 1000);

const getCountdownText = (item) => {
  const raw =
    item?.countdown ??
    item?.countDown ??
    item?.countdownText ??
    item?.countdown_text ??
    item?.timeLeft ??
    item?.time_left ??
    item?.remaining ??
    item?.remainingTime ??
    item?.remaining_time ??
    item?.expiresIn ??
    item?.expires_in ??
    item?.timer ??
    item?.timerText ??
    null;

  if (typeof raw === "string" && raw.trim()) return raw.trim();

  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw > 100000 ? formatFromMs(raw) : formatFromSeconds(raw);
  }

  if (raw && typeof raw === "object") {
    const sec =
      raw?.seconds ??
      raw?.secs ??
      raw?.s ??
      (raw?.days != null || raw?.hours != null || raw?.minutes != null
        ? Number(raw?.days || 0) * 86400 +
          Number(raw?.hours || 0) * 3600 +
          Number(raw?.minutes || 0) * 60 +
          Number(raw?.seconds || 0)
        : null);

    if (sec != null && Number.isFinite(sec)) return formatFromSeconds(sec);

    const date =
      raw?.date ??
      raw?.endDate ??
      raw?.endTime ??
      raw?.endsAt ??
      raw?.end ??
      null;
    if (date) {
      const endMs =
        typeof date === "number"
          ? date < 1e12
            ? date * 1000
            : date
          : Date.parse(date);
      if (Number.isFinite(endMs)) return formatFromMs(endMs - Date.now());
    }
  }

  const dateRaw =
    item?.countdown_end ??
    item?.countdownEnd ??
    item?.auction_end ??
    item?.auctionEnd ??
    item?.endDate ??
    item?.endTime ??
    item?.endsAt ??
    item?.expiresAt ??
    item?.expiryDate ??
    item?.deadline ??
    null;

  if (dateRaw) {
    const endMs =
      typeof dateRaw === "number"
        ? dateRaw < 1e12
          ? dateRaw * 1000
          : dateRaw
        : Date.parse(dateRaw);
    if (Number.isFinite(endMs)) return formatFromMs(endMs - Date.now());
  }

  return "";
};

const AuthorItems = ({ authorId, authorAvatar }) => {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let isMounted = true;

    async function fetchItems() {
      try {
        setStatus("loading");

        const res = await axios.get(AUTHOR_API, {
          params: { author: authorId },
        });
        const root = getRoot(res.data);
        const list = pickArray(root);

        if (!isMounted) return;
        setItems(list);
        setStatus("success");
      } catch {
        if (!isMounted) return;
        setItems([]);
        setStatus("error");
      }
    }

    fetchItems();

    return () => {
      isMounted = false;
    };
  }, [authorId]);

  const badgeSrc = useMemo(
    () => authorAvatar || AuthorImageFallback,
    [authorAvatar],
  );

  if (status === "loading") return <div>Loading NFTs…</div>;
  if (status === "error") return <div>Unable to load NFTs.</div>;

  return (
    <div className="row">
      {items.map((item, idx) => {
        const detailId = getNftId(item) ?? idx;
        const title = getTitle(item);
        const image = getImage(item);
        const priceText = getPriceText(item);
        const likesVal = getLikes(item);
        const countdownText = getCountdownText(item);

        return (
          <div
            className="col-lg-3 col-md-6 col-sm-6 col-xs-12"
            key={`${detailId}-${idx}`}
          >
            <div className="nft__item">
              <div className="author_list_pp">
                <img className="lazy" src={badgeSrc} alt="" />
                <i className="fa fa-check"></i>
              </div>

              {countdownText ? (
                <div className="de_countdown">{countdownText}</div>
              ) : null}

              <div className="nft__item_wrap">
                <Link to={`/item-details/${detailId}`}>
                  <img
                    src={image}
                    className="lazy nft__item_preview"
                    alt={title}
                  />
                </Link>
              </div>

              <div className="nft__item_info">
                <Link to={`/item-details/${detailId}`}>
                  <h4>{title}</h4>
                </Link>

                <div className="nft__item_price">{priceText}</div>

                <div className="nft__item_like">
                  <i className="fa fa-heart" aria-hidden="true"></i>
                  <span>{likesVal}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AuthorItems;
