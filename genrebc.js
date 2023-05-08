function createPopup(year, genres) {
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
const processData = (data) => {
  const topGenresPerYear = {};

  for (const year in data) {
    const genres = {};
    data[year].forEach((anime) => {
      anime.Genres.forEach((genre) => {
        if (!genres[genre]) {
          genres[genre] = 0;
        }
        genres[genre]++;
      });
    });

    const topGenres = Object.entries(genres)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre, count]) => ({
        genre,
        count,
        animes: data[year].filter((anime) => anime.Genres.includes(genre))
      }));

    topGenresPerYear[year] = topGenres;
  }

  return topGenresPerYear;
};

const createGroupedBarChart = (data) => {
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

  const years = Object.keys(data);
  const genres = Array.from(
    new Set(years.flatMap((year) => data[year].map((d) => d.genre)))
  );
  const colors = d3.scaleOrdinal().domain(genres).range(d3.schemeTableau10);

  const x = d3
    .scaleBand()
    .domain(years)
    .range([0, width])
    .paddingInner(0.2)
    .paddingOuter(0.1);
  const y = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(years.flatMap((year) => data[year].map((d) => d.count)))
    ])
    .range([height, 0]);
  const xSub = d3
    .scaleBand()
    .domain(genres)
    .range([0, x.bandwidth()])
    .padding(0.1);

  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));
  svg.append("g").call(d3.axisLeft(y));

  const yearGroups = svg
    .selectAll("g.year")
    .data(years)
    .join("g")
    .attr("class", "year")
    .attr("transform", (d) => `translate(${x(d)}, 0)`);

  yearGroups
    .selectAll("rect")
    .data((d) => data[d])
    .join("rect")
    .attr("x", (d) => xSub(d.genre))
    .attr("y", (d) => y(d.count))
    .attr("width", xSub.bandwidth())
    .attr("height", (d) => height - y(d.count))
    .attr("fill", (d) => colors(d.genre))
    .on("mouseover", (event, d) => {
      const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY + 10}px`).html(`
          <p>Year: ${d.year}</p>
          <p>Genre: ${d.genre}</p>
          <p>Anime Count: ${d.count}</p>
        `);
    })
    .on("mouseout", () => {
      d3.select(".tooltip").remove();
    })
    .on("click", (event, d) => {
      createPopup(d.year, d.genre, d.animes);
    });
};

// Assuming 'createPopup' function is implemented separately
