import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import Countdown from "../Countdown";
import "../../css/styles/skeleton.css";

import AuthorImageFallback from "../../images/author_thumbnail.jpg";
import NftImageFallback from "../../images/nftImage.jpg";

const EXPLORE_API =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/explore";

const ALLOWED_FILTERS = new Set([
  "price_low_to_high",
  "price_high_to_low",
  "likes_high_to_low",
]);

const ExploreItems = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlFilterRaw = searchParams.get("filter") || "";
  const urlFilter = ALLOWED_FILTERS.has(urlFilterRaw) ? urlFilterRaw : "";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState(urlFilter);
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    if (urlFilter !== sort) setSort(urlFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlFilter]);

  useEffect(() => {
    const next = sort ? { filter: sort } : {};
    const current = urlFilter ? { filter: urlFilter } : {};

    if (JSON.stringify(next) !== JSON.stringify(current)) {
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  useEffect(() => {
    let mounted = true;

    const fetchExplore = async () => {
      setLoading(true);
      const start = Date.now();

      try {
        const url = sort ? `${EXPLORE_API}?filter=${sort}` : EXPLORE_API;
        const res = await axios.get(url);
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
        setVisibleCount(8);
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
  }, [sort]);

  const visibleItems = useMemo(() => {
    return items.slice(0, visibleCount);
  }, [items, visibleCount]);

  const canLoadMore = visibleCount < items.length;

  const handleLoadMore = (e) => {
    e.preventDefault();
    setVisibleCount((prev) => Math.min(prev + 4, items.length));
  };

  const FilterSelect = (
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
  );

  if (loading) {
    return (
      <>
        {FilterSelect}

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
      {FilterSelect}

      <div className="row">
        {visibleItems.map((item, index) => {
          const id =
            item?.id ?? item?.nftId ?? item?.itemId ?? `explore-${index}`;
          const title = item?.title ?? item?.name ?? "Untitled";
          const image =
            item?.nftImage ?? item?.image ?? item?.imageUrl ?? NftImageFallback;

          const authorId =
            item?.authorId ??
            item?.sellerId ??
            item?.creatorId ??
            item?.ownerId;

          const authorImage =
            item?.authorImage ??
            item?.author_avatar ??
            item?.sellerImage ??
            AuthorImageFallback;

          const priceVal =
            item?.price ?? item?.nftPrice ?? item?.eth ?? item?.amount;
          const priceText =
            priceVal != null && priceVal !== "" ? `${priceVal} ETH` : "—";

          const likesVal =
            item?.likes ?? item?.favoriteCount ?? item?.favorites ?? 0;

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
                    onClick={(e) => {
                      if (authorId == null) e.preventDefault();
                    }}
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
      </div>

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
