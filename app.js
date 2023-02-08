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
    app.listen(3006, () => {
      console.log("Server Running at http://localhost:3006/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
    directorName: dbObject.director_name,
  };
};
//get all movies
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie
    ORDER BY
      movie_id;`;
  const movieArray = await db.all(getMoviesQuery);
  response.send(
    movieArray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

//post
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addedMovieQuery = `
    INSERT INTO
      movie (director_id,movie_name,lead_actor)
    VALUES
      (
        '${directorId}',
         '${movieName}',
         '${leadActor}');`;

  await db.run(addedMovieQuery);

  response.send("Movie Successfully Added");
});
//get one player
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT
      *
    FROM
      movie
    WHERE
      movie_id = ${movieId};`;
  const moviess = await db.get(getMovieQuery);
  response.send(convertDbObjectToResponseObject(moviess));
});

//put
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
    UPDATE
      movie
    SET
     director_id=${directorId},
     movie_name='${movieName}',
     lead_actor='${leadActor}'
     
    WHERE
      movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});
//delete
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM
      movie
    WHERE
      movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});
//get all directors
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT
      director_id,
      director_name
    FROM
      director
    ORDER BY
      director_id;`;
  const directorArray = await db.all(getDirectorsQuery);
  response.send(
    directorArray.map((eachDir) => convertDbObjectToResponseObject(eachDir))
  );
});
//movies of specific director
app.get("/directors/:directorId/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie NATURAL JOIN director
      WHERE director_id=${directorId}
    ORDER BY
      movie_id;`;
  const movieeArray = await db.all(getMoviesQuery);
  response.send(
    movieeArray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});
module.exports = app;
