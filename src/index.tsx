import React, { useEffect, Suspense } from "react";
import { createRoot } from "react-dom";

import useSWR from "@zeit/swr";
import { request } from "graphql-request";

import "./styles.css";

const getRandomDog = url => fetch(url).then(_ => _.json());

// https://swr.now.sh/#basic-data-loading
function BasicDataLoading() {
  const { error, data } = useSWR(
    `https://dog.ceo/api/breeds/image/random`,
    getRandomDog
  );

  return (
    <>
      {error && <p>Error! {error}</p>}
      {data && data.status === "success" && (
        <img src={data.message} alt={data.message} />
      )}
    </>
  );
}

const API = `https://graphql-pokemon.now.sh/`;
function Pokemon() {
  const { data } = useSWR(
    `{
    pokemon(name: "Pikachu") {
      name
      image
    }
  }
  `,
    query => request(API, query)
  );

  return data && <img src={data.pokemon.image} alt={data.pokemon.name} />;
  // return null;
}

const getCachedText = async text => text;
const options = {
  revalidateOnFocus: true,
  shouldRetryOnError: false
};
function CachedHeader() {
  const { data: cachedText } = useSWR("Kumar's ", getCachedText, options);

  return <h1>{cachedText}</h1>;
}

function Identity({ value }) {
  const { data } = useSWR(value, () => value, options);

  return <>{data}</>;
}

const sleep = data => new Promise(r => setTimeout(() => r(data), 2000));

function Posts() {
  const { data = [] } = useSWR(
    "https://jsonplaceholder.typicode.com/posts",
    url =>
      fetch(url)
        .then(_ => _.json())
        .then(sleep),
    { suspense: true }
  );

  return (
    <ol>
      {data.map(({ id, title, body }) => (
        <li key={id}>
          <h3>{title}</h3>
          <p>{body}</p>
        </li>
      ))}
    </ol>
  );
}

function App() {
  return (
    <div className="App">
      <CachedHeader />
      <Identity value={<h3>Sub Title</h3>} />
      <div style={{ width: "200px", height: "200px" }}>
        <BasicDataLoading />
        <Pokemon />
      </div>
      <Suspense fallback={<h2 style={{ color: "red" }}>Loading Posts...</h2>}>
        <Posts />
      </Suspense>
    </div>
  );
}

const root = document.getElementById("root");
createRoot(root).render(<App />);
