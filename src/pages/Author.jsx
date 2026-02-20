import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

import AuthorBanner from "../images/author_banner.jpg";
import AuthorImageFallback from "../images/author_thumbnail.jpg";
import AuthorItems from "../components/author/AuthorItems";

const TOP_SELLERS_API =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/topSellers";

const Author = () => {
  const { authorId } = useParams();

  const [author, setAuthor] = useState(null);
  const [loadingAuthor, setLoadingAuthor] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchAuthor = async () => {
      setLoadingAuthor(true);
      try {
        const { data } = await axios.get(TOP_SELLERS_API);

        const list = Array.isArray(data) ? data : [];
        const found = list.find((a) => String(a.authorId) === String(authorId));

        if (mounted) setAuthor(found || null);
      } catch (err) {
        console.error("Author fetch error:", err);
        if (mounted) setAuthor(null);
      } finally {
        if (mounted) setLoadingAuthor(false);
      }
    };

    fetchAuthor();
    return () => {
      mounted = false;
    };
  }, [authorId]);

  const authorName = author?.authorName || "Author";
  const authorImage = author?.authorImage || AuthorImageFallback;
  const authorPrice = author?.price != null ? `${author.price} ETH` : "";

  return (
    <div id="wrapper">
      <div className="no-bottom no-top" id="content">
        <div id="top"></div>

        <section
          id="profile_banner"
          aria-label="section"
          className="text-light"
          style={{ background: `url(${AuthorBanner}) top` }}
        ></section>

        <section aria-label="section">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="d_profile de-flex">
                  <div className="de-flex-col">
                    <div className="profile_avatar">
                      <img src={authorImage} alt={authorName} />
                      <i className="fa fa-check"></i>

                      <div className="profile_name">
                        <h4>
                          {loadingAuthor ? "Loading..." : authorName}
                          {authorPrice && (
                            <span className="profile_username">
                              {authorPrice}
                            </span>
                          )}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="profile_follow de-flex">
                    <div className="de-flex-col">
                      <div className="profile_follower"></div>
                      <Link to="#" className="btn-main">
                        Follow
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-12">
                <div className="de_tab tab_simple">
                  <AuthorItems authorId={authorId} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Author;
