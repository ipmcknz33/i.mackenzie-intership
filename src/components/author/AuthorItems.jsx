import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import AuthorImageFallback from "../../images/author_thumbnail.jpg";
import NftImageFallback from "../../images/nftImage.jpg";

const AUTHOR_API =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/authors";

const getRoot = (data) => data?.data ?? data;

const pickArray = (root) => {
  const candidates = [root?.nftCollection, root?.nfts, root?.items, root?.collection];
  const arr = candidates.find(Array.isArray);
  return Array.isArray(arr) ? arr : [];
};

const getNftId = (item) => item?.id ?? item?._id ?? item?.nftId ?? item?.tokenId ?? null;
const getTitle = (item) => item?.title ?? item?.name ?? "Untitled";
const getImage = (item) =>
  item?.nftImage ?? item?.image ?? item?.imageUrl ?? item?.img ?? NftImageFallback;

const getPriceText = (item) => {
  const price =
    item?.price != null ? item.price : item?.nftPrice != null ? item.nftPrice : null;
  return price != null && price !== "" ? `${price} ETH` : "—";
};

const getLikes = (item) => item?.likes ?? item?.favoriteCount ?? item?.favorites ?? 0;

const AuthorItems = ({ authorId, authorAvatar }) => {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | success | error

  useEffect(() => {
    let isMounted = true;

    async function fetchItems() {
      try {
        setStatus("loading");

        const res = await axios.get(AUTHOR_API, { params: { author: authorId } });
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

  const badgeSrc = useMemo(() => authorAvatar || AuthorImageFallback, [authorAvatar]);

  if (status === "loading") return <div>Loading NFTs…</div>;
  if (status === "error") return <div>Unable to load NFTs.</div>;

  return (
    <>
      {items.map((item, idx) => {
        const detailId = getNftId(item) ?? idx;
        const title = getTitle(item);
        const image = getImage(item);
        const priceText = getPriceText(item);
        const likesVal = getLikes(item);

        return (
          <div className="col-lg-3 col-md-6 col-sm-6 col-xs-12" key={`${detailId}-${idx}`}>
            <div className="nft__item">
              <div className="author_list_pp">
                <img className="lazy" src={badgeSrc} alt="" />
                <i className="fa fa-check"></i>
              </div>

              <div className="de_countdown"></div>

              <div className="nft__item_wrap">
                <Link to={`/item-details/${detailId}`}>
                  <img src={image} className="lazy nft__item_preview" alt={title} />
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
    </>
  );
};

export default AuthorItems;