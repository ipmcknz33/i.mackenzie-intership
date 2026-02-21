import React from "react";
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

/**
 * IMPORTANT:
 * Only accept real authorId-style fields.
 * Do NOT fall back to item.id / item.nftId because those are NFT identifiers.
 */
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

const ExploreItems = ({ items = [] }) => {
  const list = Array.isArray(items) ? items : [];

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

              <div className="de_countdown"></div>

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
