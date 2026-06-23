const dns = require("dns");

dns.resolveSrv(
  "_mongodb._tcp.cluster0.l46kxba.mongodb.net",
  (err, addresses) => {
    console.log("ERR:", err);
    console.log("ADDRESSES:", addresses);
  },
);
