import { useEffect, useState } from "react";

function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/posts") // ✅ This is your backend API endpoint
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched posts:", data); // Logs fetched posts to browser console
        setPosts(data); // Sets the post data into state
      })
      .catch((err) => console.error("Error fetching posts:", err));
  }, []);

  return (
    <div>
      <h1>Home Page</h1>
      {posts.length > 0 ? (
        posts.map((post) => (
          <div key={post._id} style={{ marginBottom: "20px" }}>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
          </div>
        ))
      ) : (
        <p>No posts found.</p>
      )}
    </div>
  );
}

export default Home;
