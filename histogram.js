// ... rest of the code
function handleSearch() {
  const searchValue = document
    .getElementById("search")
    .value.trim()
    .toLowerCase();

  if (searchValue.length === 0) {
    // Reset all circles to their original opacity
    d3.selectAll("circle").style("opacity", 1);
    return;
  }

  let firstMatch = null;

  d3.selectAll("circle").style("fill", function (d) {
    if (d.Name.toLowerCase().includes(searchValue)) {
      if (!firstMatch) {
        firstMatch = this;
      }
      return "black";
    } else {
      return "violet";
    }
  });

  if (firstMatch) {
    const container = document.getElementById("chart-container");
    const circlePosition = firstMatch.getBoundingClientRect();
    const containerPosition = container.getBoundingClientRect();
    container.scrollTo({
      top: circlePosition.top - containerPosition.top + container.scrollTop,
      left: circlePosition.left - containerPosition.left + container.scrollLeft,
      behavior: "smooth"
    });
  }
}

// Add an event listener to the search input
document.getElementById("search").addEventListener("input", handleSearch);

//const colorScale = d3.scaleLinear().domain([0, maxEpisodes]).range([0, 1]);

d3.json("years.json").then((data) => {
  const margin = { top: 10, right: 30, bottom: 50, left: 50 };
  const width = 20000 - margin.left - margin.right;
  const height = 30000 - margin.top - margin.bottom;

  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const flattenedData = Object.entries(data).flatMap(([year, animes]) =>
    animes.map((anime, index) => ({ ...anime, year, index }))
  );

  const maxEpisodes = d3.max(flattenedData, (d) => parseInt(d.Episodes, 10));
  const colorScale = d3.scaleLinear().domain([0, maxEpisodes]).range([0, 20]);

  const y = d3
    .scaleBand()
    .domain(Object.keys(data))
    .range([0, height])
    .padding(0.2);

  svg
    .selectAll("circle")
    .data(flattenedData)
    .join("circle")
    .attr("cx", (d) => 20 * (d.index % 30) + 20)
    .attr("cy", (d) => y(d.year) + Math.floor(d.index / 30) * 20)

    .attr("r", 3)
    .style("fill", (d) =>
      d3.interpolatePurples(colorScale(parseInt(d.Episodes, 10)))
    )
    .on("mouseover", (event, d) => {
      const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY + 10}px`).html(`
          <p>Name: ${d.Name}</p>
          <p>Year: ${d.year}</p>
          <p>Episodes: ${d.Episodes}</p>
          <p>Genres: ${d.Genres}</p>
          <p>Type: ${d.Type}</p>
          <p>Studios: ${d.Studios}</p>
          <p>Source: ${d.Source}</p>
        `);
    })
    .on("mouseout", () => {
      d3.select(".tooltip").remove();
    });

  svg.append("g").call(d3.axisLeft(y));

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left)
    .style("text-anchor", "middle")
    .text("Year");
});
