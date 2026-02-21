import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import AuthorImageFallback from "../../images/author_thumbnail.jpg";
import NftImageFallback from "../../images/nftImage.jpg";

const toStr = (v) => (v == null ? null : String(v));

const getNftId = (item) => item?.nftId ?? item?.id ?? item?._id ?? null;

const getTitle = (item) => item?.title ?? item?.name ?? "Untitled";

const getNftImage = (item) =>
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

const getAuthorId = (item) =>
  toStr(
    item?.authorId ??
      item?.author?.authorId ??
      item?.creator?.authorId ??
      item?.owner?.authorId ??
      item?.seller?.authorId ??
      null,
  );

const getAuthorAvatar = (item) =>
  item?.authorImage ??
  item?.authorAvatar ??
  item?.author?.authorImage ??
  item?.author?.profileImg ??
  item?.author?.profileImage ??
  item?.author?.avatar ??
  item?.author?.image ??
  item?.creator?.authorImage ??
  item?.creator?.profileImg ??
  item?.creator?.profileImage ??
  item?.creator?.avatar ??
  item?.creator?.image ??
  item?.owner?.authorImage ??
  item?.owner?.profileImg ??
  item?.owner?.profileImage ??
  item?.owner?.avatar ??
  item?.owner?.image ??
  null;

const parseCountdownTextToSeconds = (text) => {
  if (!text || typeof text !== "string") return null;
  const t = text.trim().toLowerCase();
  const m = t.match(
    /(?:(\d+)\s*d)?\s*(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?\s*(?:(\d+)\s*s)?/,
  );
  if (!m) return null;
  const d = Number(m[1] || 0);
  const h = Number(m[2] || 0);
  const mi = Number(m[3] || 0);
  const s = Number(m[4] || 0);
  const total = d * 86400 + h * 3600 + mi * 60 + s;
  return total > 0 ? total : null;
};

const formatRemaining = (ms) => {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  if (days > 0) return `${days}d ${hours}h ${mins}m ${secs}s`;
  return `${hours}h ${mins}m ${secs}s`;
};

const getEndMsFromItem = (item) => {
  const raw =
    item?.auction_end ??
    item?.auctionEnd ??
    item?.countdown_end ??
    item?.countdownEnd ??
    item?.endsAt ??
    item?.endDate ??
    item?.endTime ??
    item?.expiresAt ??
    item?.expiryDate ??
    item?.deadline ??
    null;

  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw < 1e12 ? raw * 1000 : raw;
  }

  if (typeof raw === "string" && raw.trim()) {
    const parsed = Date.parse(raw);
    if (Number.isFinite(parsed)) return parsed;
  }

  const text =
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

  if (typeof text === "number" && Number.isFinite(text)) {
    const ms = text > 100000 ? text : text * 1000;
    return Date.now() + ms;
  }

  if (typeof text === "string" && text.trim()) {
    const seconds = parseCountdownTextToSeconds(text);
    if (seconds != null) return Date.now() + seconds * 1000;
  }

  return null;
};

const ExploreItems = ({ items = [] }) => {
  const list = Array.isArray(items) ? items : [];

  const [now, setNow] = useState(() => Date.now());
  const endByIdRef = useRef(new Map());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      {list.map((item, idx) => {
        const nftId = getNftId(item);
        const title = getTitle(item);
        const image = getNftImage(item);
        const priceText = getPriceText(item);
        const likesVal = getLikes(item);

        const authorId = getAuthorId(item);
        const avatar = getAuthorAvatar(item) || AuthorImageFallback;

        const key = String(nftId ?? idx);
        let endMs = endByIdRef.current.get(key);
        if (endMs == null) {
          endMs = getEndMsFromItem(item);
          if (endMs != null) endByIdRef.current.set(key, endMs);
        }

        const countdownText =
          endMs != null ? formatRemaining(Math.max(0, endMs - now)) : "";

        return (
          <div
            className="col-lg-3 col-md-6 col-sm-6 col-xs-12"
            key={`${nftId ?? "nft"}-${idx}`}
          >
            <div className="nft__item">
              <div className="author_list_pp">
                {authorId ? (
                  <Link to={`/author/${authorId}`}>
                    <img className="lazy" src={avatar} alt="" />
                    <i className="fa fa-check"></i>
                  </Link>
                ) : (
                  <>
                    <img className="lazy" src={avatar} alt="" />
                    <i className="fa fa-check"></i>
                  </>
                )}
              </div>

              {countdownText ? (
                <div className="de_countdown">{countdownText}</div>
              ) : null}

              <div className="nft__item_wrap">
                <Link to={`/item-details/${nftId}`}>
                  <img
                    src={image}
                    className="lazy nft__item_preview"
                    alt={title}
                  />
                </Link>
              </div>

              <div className="nft__item_info">
                <Link to={`/item-details/${nftId}`}>
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
    </>
  );
};

export default ExploreItems;
