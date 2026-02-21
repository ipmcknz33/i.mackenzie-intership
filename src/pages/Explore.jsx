import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import HeaderExplore from "../components/explore/HeaderExplore";
import ExploreItems from "../components/explore/ExploreItems";

const EXPLORE_REQUESTS = [
  {
    url: "https://us-central1-nft-cloud-functions.cloudfunctions.net/explore",
    params: () => ({}),
  },
  {
    url: "https://us-central1-nft-cloud-functions.cloudfunctions.net/marketplace",
    params: () => ({}),
  },
  {
    url: "https://us-central1-nft-cloud-functions.cloudfunctions.net/nfts",
    params: () => ({}),
  },
];

const getRoot = (data) => data?.data ?? data;

const toArray = (value) => {
  if (Array.isArray(value)) return value;

  const candidates = [
    value?.items,
    value?.nfts,
    value?.nftCollection,
    value?.results,
    value?.data,
  ];

  const arr = candidates.find(Array.isArray);
  return Array.isArray(arr) ? arr : [];
};

const looksLikeNft = (x) =>
  Boolean(
    x &&
      typeof x === "object" &&
      (x.title || x.name || x.image || x.imageUrl || x.nftImage)
  );

const looksLikeList = (arr) =>
  Array.isArray(arr) && (arr.length === 0 || looksLikeNft(arr[0]));

const INITIAL_COUNT = 8;
const LOAD_MORE_STEP = 4;

const Explore = () => {
  const [allItems, setAllItems] = useState([]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const [status, setStatus] = useState("loading"); // loading | success | error

  useEffect(() => {
    let mounted = true;

    async function fetchExplore() {
      setStatus("loading");
      setAllItems([]);
      setVisibleCount(INITIAL_COUNT);

      for (const req of EXPLORE_REQUESTS) {
        try {
          const res = await axios.get(req.url, { params: req.params() });
          const root = getRoot(res.data);

          const list1 = toArray(root);
          if (looksLikeList(list1)) {
            if (!mounted) return;
            setAllItems(list1);
            setStatus("success");
            return;
          }

          const list2 = toArray(getRoot(root));
          if (looksLikeList(list2)) {
            if (!mounted) return;
            setAllItems(list2);
            setStatus("success");
            return;
          }
        } catch {
          // try next endpoint
        }
      }

      if (!mounted) return;
      setStatus("error");
    }

    fetchExplore();

    return () => {
      mounted = false;
    };
  }, []);

  const visibleItems = useMemo(
    () => allItems.slice(0, visibleCount),
    [allItems, visibleCount]
  );

  const canLoadMore = visibleCount < allItems.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + LOAD_MORE_STEP, allItems.length));
  };

  return (
    <>
      <HeaderExplore />

      <div className="container" style={{ paddingTop: 30, paddingBottom: 50 }}>
        {status === "loading" ? (
          <div>Loading NFTs…</div>
        ) : status === "error" ? (
          <div
            style={{
              padding: 18,
              border: "1px solid rgba(0,0,0,0.12)",
              borderRadius: 12,
              background: "#fff",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Explore unavailable</div>
            <div style={{ opacity: 0.9 }}>
              The explore API didn’t return a valid list.
            </div>
          </div>
        ) : (
          <>
            <div className="row">
              <ExploreItems items={visibleItems} />
            </div>

            {canLoadMore ? (
              <div style={{ display: "flex", justifyContent: "center", marginTop: 26 }}>
                <button className="btn btn-main" onClick={handleLoadMore}>
                  Load more
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </>
  );
};

export default Explore;