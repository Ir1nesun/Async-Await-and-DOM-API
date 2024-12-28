// Методы, которые могут пригодиться:
// starWars.searchCharacters(query), 
// starWars.searchPlanets(query), 
// starWars.searchSpecies(query).
// starWars.getCharactersById(id), 
// starWars.getPlanetsById(id), 
// starWars.getSpeciesById(id)

// Тут ваш код.

document.addEventListener("DOMContentLoaded", () => {
  const searchBlock = document.getElementById("byQueryBlock");
  const inputField = document.querySelector(".search input");
  const searchButton = document.getElementById("byQueryBtn");
  const spinner = document.querySelector(".spinner");
  const resultContainer = document.getElementById("result-container");
  const contentContainer = document.getElementById("content");
  const messageHeader = document.querySelector(".message-header");
  const closeButton = document.querySelector(".message-header .delete");

  const resources = [
      { value: "people", label: "People" },
      { value: "planet", label: "Planets" },
      { value: "species", label: "Species" },
  ];

  const showSpinner = () => {
      spinner.style.visibility = "visible";
      spinner.style.zIndex = "1000"; 
  };

  const hideSpinner = () => {
      spinner.style.visibility = "hidden";
  };

  const scrollToResults = () => {
      resultContainer.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  async function fetchAdditionalData(urls) {
      const results = [];
      for (const url of urls) {
          try {
              const response = await fetch(url);
              const data = await response.json();
              results.push(data);
          } catch (error) {
              console.error("Error fetching additional data:", error);
              results.push({ title: "Unknown" });
          }
      }
      return results.map((item) => item.title || item.name || "Unknown").join(", ");
  }

  async function displayResults(data, resource) {
      if (!data || Object.keys(data).length === 0) {
          contentContainer.innerHTML = "<p>No results found</p>";
          resultContainer.style.visibility = "visible";
          scrollToResults();
          return;
      }

      let resultHtml = "";

      switch (resource) {
          case "people":
              const homeworld = data.homeworld
                  ? await fetchAdditionalData([data.homeworld])
                  : "Unknown";

              const films = data.films.length
                  ? await fetchAdditionalData(data.films)
                  : "None";

              const species = data.species.length
                  ? await fetchAdditionalData(data.species)
                  : "None";

              const vehicles = data.vehicles.length
                  ? await fetchAdditionalData(data.vehicles)
                  : "None";

              const starships = data.starships.length
                  ? await fetchAdditionalData(data.starships)
                  : "None";

              resultHtml = `
                  <p><strong>Name:</strong> ${data.name || "Unknown"}</p>
                  <p><strong>Height:</strong> ${data.height || "Unknown"} cm</p>
                  <p><strong>Mass:</strong> ${data.mass || "Unknown"} kg</p>
                  <p><strong>Hair Color:</strong> ${data.hair_color || "Unknown"}</p>
                  <p><strong>Skin Color:</strong> ${data.skin_color || "Unknown"}</p>
                  <p><strong>Eye Color:</strong> ${data.eye_color || "Unknown"}</p>
                  <p><strong>Birth Year:</strong> ${data.birth_year || "Unknown"}</p>
                  <p><strong>Gender:</strong> ${data.gender || "Unknown"}</p>
                  <p><strong>Homeworld:</strong> ${homeworld}</p>
                  <p><strong>Films:</strong> ${films}</p>
                  <p><strong>Species:</strong> ${species}</p>
                  <p><strong>Vehicles:</strong> ${vehicles}</p>
                  <p><strong>Starships:</strong> ${starships}</p>
                  <p><strong>Created:</strong> ${data.created || "Unknown"}</p>
                  <p><strong>Edited:</strong> ${data.edited || "Unknown"}</p>
                  <p><strong>URL:</strong> <a href="${data.url}" target="_blank">${data.url}</a></p>
              `;
              break;

          case "planet":
              resultHtml = `
                  <p><strong>Name:</strong> ${data.name || "Unknown"}</p>
                  <p><strong>Climate:</strong> ${data.climate || "Unknown"}</p>
                  <p><strong>Population:</strong> ${data.population || "Unknown"}</p>
                  <p><strong>Residents:</strong> ${
                      data.residents.length
                          ? await fetchAdditionalData(data.residents)
                          : "None"
                  }</p>
                  <p><strong>Films:</strong> ${
                      data.films.length ? await fetchAdditionalData(data.films) : "None"
                  }</p>
              `;
              break;

          case "species":
              resultHtml = `
                  <p><strong>Name:</strong> ${data.name || "Unknown"}</p>
                  <p><strong>Classification:</strong> ${data.classification || "Unknown"}</p>
                  <p><strong>Designation:</strong> ${data.designation || "Unknown"}</p>
                  <p><strong>Language:</strong> ${data.language || "Unknown"}</p>
                  <p><strong>Average Lifespan:</strong> ${
                      data.average_lifespan || "Unknown"
                  } years</p>
                  <p><strong>Homeworld:</strong> ${
                      data.homeworld
                          ? await fetchAdditionalData([data.homeworld])
                          : "Unknown"
                  }</p>
                  <p><strong>Films:</strong> ${
                      data.films.length ? await fetchAdditionalData(data.films) : "None"
                  }</p>
              `;
              break;

          default:
              resultHtml = "<p>Invalid resource type</p>";
      }

      contentContainer.innerHTML = resultHtml;
      resultContainer.style.visibility = "visible";
      scrollToResults();
  }

  async function fetchData(query, resource, method) {
      showSpinner();

      try {
          await new Promise((resolve) => setTimeout(resolve, 2000));

          const data = await method(query);

          console.log("Fetched data:", data);

          if (data.results && data.results.length > 0) {
              await displayResults(data.results[0], resource);
          } else if (!data.results && Object.keys(data).length > 0) {
              await displayResults(data, resource);
          } else {
              contentContainer.innerHTML = "<p>No results found</p>";
              resultContainer.style.visibility = "visible";
          }
      } catch (error) {
          console.error("Error fetching data:", error);
          contentContainer.innerHTML = "<p>Failed to fetch data</p>";
          resultContainer.style.visibility = "visible";
      } finally {
          hideSpinner();
      }
  }

  closeButton.addEventListener("click", () => {
      resultContainer.style.visibility = "hidden";
      contentContainer.innerHTML = "";
  });

  messageHeader.style.zIndex = "1";

  searchButton.addEventListener("click", () => {
      const query = inputField.value.trim();
      const resourceSelector = document.getElementById("resourceSelector");
      const resource = resourceSelector.value;

      const methods = {
          people: starWars.searchCharacters,
          planet: starWars.searchPlanets,
          species: starWars.searchSpecies,
      };

      fetchData(query, resource, methods[resource]);
  });

  inputField.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
          searchButton.click();
      }
  });

  const resourceSelector = document.createElement("select");
  resourceSelector.id = "resourceSelector";
  resourceSelector.className = "is-large select";
  resourceSelector.style.marginRight = "10px";

  resources.forEach((resource) => {
      const option = document.createElement("option");
      option.value = resource.value;
      option.textContent = resource.label;
      resourceSelector.appendChild(option);
  });

  searchBlock.insertBefore(resourceSelector, inputField);

  const secondSearchBlock = document.createElement("div");
  secondSearchBlock.className = "search";
  secondSearchBlock.style.display = "flex";
  secondSearchBlock.style.justifyContent = "center";
  secondSearchBlock.style.marginTop = "20px";

  const secondResourceSelector = resourceSelector.cloneNode(true);
  const secondInputField = document.createElement("input");
  secondInputField.className = "is-large input";
  secondInputField.placeholder = "Search by ID...";

  const secondSearchButton = document.createElement("button");
  secondSearchButton.className = "is-large button";
  secondSearchButton.textContent = "Get by ID";

  secondSearchBlock.appendChild(secondResourceSelector);
  secondSearchBlock.appendChild(secondInputField);
  secondSearchBlock.appendChild(secondSearchButton);

  const orText = document.createElement("div");
  orText.textContent = "OR";
  orText.style.fontSize = "1.5rem";
  orText.style.fontWeight = "bold";
  orText.style.margin = "20px 0";
  orText.style.textAlign = "center";

  searchBlock.parentNode.insertBefore(orText, searchBlock.nextSibling);
  orText.parentNode.insertBefore(secondSearchBlock, orText.nextSibling);

  secondSearchButton.addEventListener("click", () => {
      const query = secondInputField.value.trim();
      const resource = secondResourceSelector.value;

      const methods = {
          people: starWars.getCharactersById,
          planet: starWars.getPlanetsById,
          species: starWars.getSpeciesById,
      };

      fetchData(query, resource, methods[resource]);
  });

  secondInputField.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
          secondSearchButton.click();
      }
  });
});




















