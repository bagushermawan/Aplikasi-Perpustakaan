<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Http\Resources\BookResource;
use Illuminate\Http\Request;

class BookController extends Controller
{
    public function index()
    {
        $perPage = request('per_page', 5);
        $search  = request('search');

        $query = Book::query()->orderBy('title', 'asc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('author', 'like', "%{$search}%");
            });
        }

        return BookResource::collection(
            $query->paginate($perPage)->appends([
                'per_page' => $perPage,
                'search'   => $search,
            ])
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'  => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'stock'  => 'required|integer|min:0',
        ]);

        $book = Book::create($data);

        return new BookResource($book);
    }

    public function show(Book $book)
    {
        return new BookResource($book);
    }

    public function update(Request $request, Book $book)
    {
        $data = $request->validate([
            'title'  => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'stock'  => 'required|integer|min:0',
        ]);

        $book->update($data);

        return new BookResource($book);
    }

    public function destroy(Book $book)
    {
        $book->delete();
        return response()->json(['message' => 'Book deleted']);
    }
}
