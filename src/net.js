let methods = [
  "HEAD",
  "GET",
  "PUT",
  "POST",
  "DELETE",
  "CONNECT",
  "OPTIONS",
  "TRACE"
].map(v => {
  return {
    [v.toLowerCase()]: (url, body) => {
      let opt = {
        method: v,
        mode: "cors",
        body: JSON.stringify(body),
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      };
      return (async function() {
        let res = await fetch(domain + url, opt);
        if (!!res.ok) return res;
        throw new Error(res.status);
      })();
    }
  };
});
let Net = Object.assign({}, ...methods);

export default Net;
