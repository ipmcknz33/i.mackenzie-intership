import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Countdown from "../Countdown";
import "../../css/styles/skeleton.css";

import AuthorImageFallback from "../../images/author_thumbnail.jpg";
import NftImageFallback from "../../images/nftImage.jpg";

const EXPLORE_API =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/explore";

const ExploreItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("");
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    let mounted = true;

    const fetchExplore = async () => {
      setLoading(true);
      const start = Date.now();

      try {
        const res = await axios.get(EXPLORE_API);
        const data = res?.data;

        const elapsed = Date.now() - start;
        if (elapsed < 2000) {
          await new Promise((r) => setTimeout(r, 2000 - elapsed));
        }

        if (!mounted) return;

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : [];
        setItems(list);
      } catch (err) {
        console.error("Explore fetch error:", err);
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchExplore();
    return () => {
      mounted = false;
    };
  }, []);

  const sortedItems = useMemo(() => {
    const copy = [...items];

    const getPrice = (it) => {
      const p = it.price ?? it.nftPrice ?? it.eth ?? it.amount;
      const n = Number(p);
      return Number.isFinite(n) ? n : 0;
    };

    const getLikes = (it) => {
      const l = it.likes ?? it.favoriteCount ?? it.favorites ?? 0;
      const n = Number(l);
      return Number.isFinite(n) ? n : 0;
    };

    if (sort === "price_low_to_high") {
      copy.sort((a, b) => getPrice(a) - getPrice(b));
    } else if (sort === "price_high_to_low") {
      copy.sort((a, b) => getPrice(b) - getPrice(a));
    } else if (sort === "likes_high_to_low") {
      copy.sort((a, b) => getLikes(b) - getLikes(a));
    }

    return copy;
  }, [items, sort]);

  const visibleItems = useMemo(
    () => sortedItems.slice(0, visibleCount),
    [sortedItems, visibleCount],
  );

  const canLoadMore = visibleCount < sortedItems.length;

  const handleLoadMore = (e) => {
    e.preventDefault();
    setVisibleCount((prev) => Math.min(prev + 4, sortedItems.length));
  };

  if (loading) {
    return (
      <>
        <div style={{ marginBottom: 12 }}>
          <select
            id="filter-items"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="">Default</option>
            <option value="price_low_to_high">Price, Low to High</option>
            <option value="price_high_to_low">Price, High to Low</option>
            <option value="likes_high_to_low">Most liked</option>
          </select>
        </div>

        <div className="row">
          {new Array(8).fill(0).map((_, index) => (
            <div
              key={index}
              className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12"
              style={{ display: "block", backgroundSize: "cover" }}
            >
              <div className="nft__item">
                <div className="author_list_pp">
                  <div className="ip-skel ip-skel--avatar" />
                </div>

                {/* countdown placeholder */}
                <div className="de_countdown">
                  <div
                    className="ip-skel ip-skel--text"
                    style={{ width: 90 }}
                  />
                </div>

                <div className="nft__item_wrap">
                  <div className="ip-skel ip-skel--image" />
                </div>

                <div className="nft__item_info">
                  <div
                    className="ip-skel ip-skel--text"
                    style={{ width: 140, marginBottom: 8 }}
                  />
                  <div
                    className="ip-skel ip-skel--text"
                    style={{ width: 80, marginBottom: 8 }}
                  />

                  <div className="nft__item_like">
                    <div
                      className="ip-skel ip-skel--text"
                      style={{ width: 50 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load more placeholder (optional) */}
        <div className="col-md-12 text-center">
          <span
            className="btn-main lead"
            style={{ opacity: 0.6, cursor: "not-allowed" }}
          >
            Load more
          </span>
        </div>
      </>
    );
  }
  return (
    <>
      <div style={{ marginBottom: 12 }}>
        <select
          id="filter-items"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="">Default</option>
          <option value="price_low_to_high">Price, Low to High</option>
          <option value="price_high_to_low">Price, High to Low</option>
          <option value="likes_high_to_low">Most liked</option>
        </select>
      </div>

      {visibleItems.map((item, index) => {
        const id = item.id ?? item.nftId ?? item.itemId ?? `explore-${index}`;
        const title = item.title ?? item.name ?? "Untitled";
        const image =
          item.nftImage ?? item.image ?? item.imageUrl ?? NftImageFallback;

        const authorId =
          item.authorId ?? item.sellerId ?? item.creatorId ?? item.ownerId;
        const authorImage =
          item.authorImage ??
          item.author_avatar ??
          item.sellerImage ??
          AuthorImageFallback;

        const priceVal = item.price ?? item.nftPrice;
        const priceText = priceVal != null ? `${priceVal} ETH` : "—";

        const likesVal =
          item.likes ?? item.favoriteCount ?? item.favorites ?? 0;

        return (
          <div
            key={id}
            className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12"
            style={{ display: "block", backgroundSize: "cover" }}
          >
            <div className="nft__item">
              <div className="author_list_pp">
                <Link
                  to={authorId != null ? `/author/${authorId}` : "#"}
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                >
                  <img className="lazy" src={authorImage} alt="" />
                  <i className="fa fa-check"></i>
                </Link>
              </div>

              <Countdown endTime={Date.now() + 5 * 60 * 60 * 1000} />

              <div className="nft__item_wrap">
                <div className="nft__item_extra">
                  <div className="nft__item_buttons">
                    <button type="button">Buy Now</button>
                    <div className="nft__item_share">
                      <h4>Share</h4>

                      <a href="#" onClick={(e) => e.preventDefault()}>
                        <i className="fa fa-facebook fa-lg"></i>
                      </a>
                      <a href="#" onClick={(e) => e.preventDefault()}>
                        <i className="fa fa-twitter fa-lg"></i>
                      </a>
                      <a href="#" onClick={(e) => e.preventDefault()}>
                        <i className="fa fa-envelope fa-lg"></i>
                      </a>
                    </div>
                  </div>
                </div>

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

                <div className="nft__item_price">{priceText}</div>

                <div className="nft__item_like">
                  <i className="fa fa-heart"></i>
                  <span>{likesVal}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <div className="col-md-12 text-center">
        {canLoadMore ? (
          <a
            href="#"
            id="loadmore"
            className="btn-main lead"
            onClick={handleLoadMore}
          >
            Load more
          </a>
        ) : (
          <div style={{ opacity: 0.7, marginTop: 10 }}>No more items.</div>
        )}
      </div>
    </>
  );
};

export default ExploreItems;
