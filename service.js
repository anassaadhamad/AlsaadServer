var Service = require("node-windows").Service;

// Create a new service object
var svc = new Service({
  name: "Alsaad Server",
  description: "Alssad Mall Server",
  script: `${__dirname}/server.js`,
  nodeOptions: ["--harmony", "--max_old_space_size=4096"],
});

svc.on("install", function () {
  svc.start();
});

svc.install();
