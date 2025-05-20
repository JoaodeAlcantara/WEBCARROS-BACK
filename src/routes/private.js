import { Router } from "express";
import authController from "../controllers/authController.js";
import carController from "../controllers/carController.js";
import carImageController from "../controllers/carImagesController.js";
import favoritesController from "../controllers/favoritesController.js";
import upload from "../middlewares/imageUpload.js";
import auth from "../middlewares/auth.js";

const routes = Router();

// USER
routes.get('/list-user', authController.getAllUser);
routes.get('/list-user-id', authController.getUserById);
routes.put('/update-user', authController.updateUser);

// CARS
routes.post('/add-car', upload.array('images', 10), carController.create);
routes.get('/list-car/my', carController.getCarsByUserId);
routes.put('/update-car/id/:carId', auth.authorizeCarOwner, upload.array('images', 10), carController.update);
routes.patch('/delete-car/id/:carId', auth.authorizeCarOwner, carController.delete);
routes.patch('/update-status/id/:carId', auth.authorizeCarOwner, carController.updateState)

// IMAGES
routes.get('/list-image/id/:id', carImageController.getImageById)
routes.post('/add-image/id/:carId', auth.authorizeCarOwner, upload.array('images', 10), carImageController.create)
routes.patch('/update-image/id/:carId', auth.authorizeCarOwner, upload.array('images', 10), carImageController.update);
routes.delete('/delete-image/car/:carId/img/:imgId', auth.authorizeCarOwner, carImageController.delete);

// FAVORITES
routes.post('/add-favorite-car/id/:carId', upload.array('images', 10), favoritesController.create);
routes.get('/list-favorite-car', favoritesController.getAllFavorites);
routes.get('/list-favorite-car/id/:id', favoritesController.getFavoritesById);
routes.get('/list-favorite-car/my', favoritesController.getFavoritesByUserId);
routes.get('/list-favorite/name/:group', favoritesController.getFavoritesByGroupAndUserId);
routes.get('/list-favorite-formated/my', favoritesController.getFavoritesWithGroupByUserId)
routes.delete('/delete-favorite-item/id/:id', favoritesController.deleteItem);
routes.delete('/delete-group-items/name/:group', favoritesController.deleteGroupAndItems);
routes.patch('/update-group-name/name/:group', upload.array('images', 10), favoritesController.deleteOrUpdateGroupName);





export default routes;