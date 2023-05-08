function createPopup(year, animes) {
  const popup = d3
    .select("body")
    .append("div")
    .attr("class", "popup")
    .style("display", "block");

  popup.append("h3").text(`Anime created in ${year}`).append("hr");

  const animeContainer = popup.append("div").attr("class", "anime-container");

  const updateAnimes = (startIndex) => {
    const endIndex = startIndex + 10;
    const paginatedAnimes = animes.slice(startIndex, endIndex).join("<br>");
    animeContainer.html(`<p>${paginatedAnimes}</p>`);

    const nextButton = popup.select(".next-button");
    const prevButton = popup.select(".prev-button");

    nextButton.style(
      "visibility",
      endIndex < animes.length ? "visible" : "hidden"
    );
    prevButton.style("visibility", startIndex > 0 ? "visible" : "hidden");
  };

  popup
    .append("button")
    .text("Prev")
    .attr("class", "prev-button")
    .on("click", () => {
      const startIndex = parseInt(animeContainer.attr("data-start")) - 10;
      animeContainer.attr("data-start", startIndex);
      updateAnimes(startIndex);
    });

  popup
    .append("button")
    .text("Next")
    .attr("class", "next-button")
    .on("click", () => {
      const startIndex = parseInt(animeContainer.attr("data-start")) + 10;
      animeContainer.attr("data-start", startIndex);
      updateAnimes(startIndex);
    });

  const closeButton = popup
    .append("button")
    .text("X")
    .attr("class", "close-button")
    .on("click", () => {
      popup.remove();
    });

  closeButton
    .style("position", "absolute")
    .style("top", "5px")
    .style("right", "5px");

  animeContainer.attr("data-start", 0);
  updateAnimes(0);
}

d3.json("years.json").then((data) => {
  const margin = { top: 10, right: 30, bottom: 50, left: 50 };
  const width = 960 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const yearCounts = Object.entries(data).map(([year, animes]) => ({
    year,
    count: animes.length,
    animes: animes.map((anime) => anime.Name)
  }));

  const x = d3
    .scaleBand()
    .domain(yearCounts.map((d) => d.year))
    .range([0, width])
    .padding(0.2);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(yearCounts, (d) => d.count)])
    .range([height, 0]);

  svg
    .selectAll("rect")
    .data(yearCounts)
    .join("rect")
    .attr("x", (d) => x(d.year))
    .attr("y", (d) => y(d.count))
    .attr("width", x.bandwidth())
    .attr("height", (d) => height - y(d.count))
    .style("fill", "violet")
    .on("mouseover", (event, d) => {
      const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY + 10}px`).html(`
          <p>Year: ${d.year}</p>
          <p>Anime Count: ${d.count}</p>
        `);
    })
    .on("mouseout", () => {
      d3.select(".tooltip").remove();
    })
    .on("click", (event, d) => {
      createPopup(d.year, d.animes);
    });

  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));

  svg.append("g").call(d3.axisLeft(y));

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom)
    .style("text-anchor", "middle")
    .text("Year");

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left)
    .style("text-anchor", "middle")
    .text("Anime Count");
});
