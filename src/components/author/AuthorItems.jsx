import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const NEW_ITEMS_API =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/newItems";

const AuthorItems = ({ authorId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchItems = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(NEW_ITEMS_API);
        const list = Array.isArray(data) ? data : [];

        const aid = String(authorId);

        const filtered = list.filter((item) => {
          const possibleIds = [
            item.authorId,
            item.sellerId,
            item.creatorId,
            item.ownerId,
          ]
            .filter((v) => v != null)
            .map((v) => String(v));

          return possibleIds.includes(aid);
        });

        if (mounted) setItems(filtered);
      } catch (err) {
        console.error("Author items fetch error:", err);
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchItems();
    return () => {
      mounted = false;
    };
  }, [authorId]);

  if (loading) {
    return (
      <div className="text-center mt-4">
        <p>Loading items...</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="text-center mt-4">
        <p>No items found for this author.</p>
        <p style={{ opacity: 0.7 }}>
          This usually means the items API doesn’t use <code>authorId</code> for
          matching (it may use <code>sellerId</code> / <code>creatorId</code>).
        </p>
      </div>
    );
  }

  return (
    <div className="row">
      {items.map((item, idx) => {
        const id = item.id ?? item.nftId ?? item.itemId ?? `item-${idx}`;
        const title = item.title ?? item.name ?? "Untitled";
        const image = item.nftImage ?? item.image ?? item.imageUrl;
        const price =
          item.price != null
            ? item.price
            : item.nftPrice != null
              ? item.nftPrice
              : null;
        const likes =
          item.likes != null
            ? item.likes
            : item.favoriteCount != null
              ? item.favoriteCount
              : 0;

        return (
          <div className="col-lg-3 col-md-6 col-sm-6 col-xs-12" key={id}>
            <div className="nft__item">
              <div className="nft__item_wrap">
                <Link to={`/item-details/${id}`}>
                  <img
                    src={image}
                    className="lazy nft__item_preview"
                    alt={title}
                  />
                </Link>
              </div>

              <div className="nft__item_info">
                <Link to={`/item-details/${id}`}>
                  <h4>{title}</h4>
                </Link>

                <div className="nft__item_price">
                  {price != null ? `${price} ETH` : "—"}
                </div>

                <div className="nft__item_like">
                  <i className="fa fa-heart"></i>
                  <span>{likes}</span>
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
