<?php

namespace App\Http\Controllers;

use App\Models\Location;
use App\Models\Route;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function index()
    {
        return view('admin.dashboard');
    }

    public function locations()
    {
        $locations = Location::all();
        return response()->json($locations);
    }

    public function routes()
    {
        $routes = Route::all();
        return response()->json($routes);
    }

    public function storeLocation(Request $request)
    {
        $location = Location::create($request->all());
        return response()->json($location, 201);
    }

    public function updateLocation(Request $request, $id)
    {
        $location = Location::findOrFail($id);
        $location->update($request->all());
        return response()->json($location, 200);
    }

    public function deleteLocation($id)
    {
        Location::findOrFail($id)->delete();
        return response()->json(null, 204);
    }

    // Аналогичные методы для маршрутов (Route)
}
