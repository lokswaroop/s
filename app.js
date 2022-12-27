const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
////
let changeDbObjectToResponseObject1 = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

let changeDbObjectToResponseObject2 = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
      *
    FROM
      movie
    WHERE
      movie_name`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachone) => changeDbObjectToResponseObject1(eachone))
  );
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const createMovieQuery = `
      INSERT INTO 
      movie(director_id,movie_name,lead_actor)
      VALUES(${directorId},'${movieName}','${leadActor}')`;
  const dbResponse = await db.run(createMovieQuery);
  const m = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT
      *
    FROM
      movie
    WHERE 
    movie_id=${movieId} `;
  const mov = await db.get(getMovieQuery);
  response.send(mov.map((eachone) => changeDbObjectToResponseObject1(eachone)));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
    UPDATE 
    movie
    SET 
    director_id=${directorId},movie_name='${movieName}',lead_actor='${leadActor}'
    WHERE 
    movie_id=${movieId}`;
  const put = await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM 
    movie
    WHERE 
    movie_id=${movieId}`;
  const del = await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT
      *
    FROM
      director`;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachone) => changeDbObjectToResponseObject2(eachone))
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieQuery = `
    SELECT
      *
    FROM
      movie NATURAL JOIN director
    WHERE 
    movie_name=${movieName} `;
  const v = await db.all(getMovieQuery);
  response.send(v);
});

module.exports = app;
