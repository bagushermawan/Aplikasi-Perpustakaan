<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Http\Resources\BookResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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

    public function all()
    {
        return Book::select('id', 'title', 'stock')->orderBy('title', 'asc')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'  => 'required|string|max:255',
            'author' => 'nullable|string|max:255',
            'stock'  => 'required|integer|min:0',
            'harga'  => 'required|numeric|min:1',
            'cover'  => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('cover')) {
            $path = $request->file('cover')->store('covers', 'public');
            $data['cover'] = $path;
        }

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
            'author' => 'nullable|string|max:255',
            'stock'  => 'required|integer|min:0',
            'harga'  => 'required|numeric|min:1',
            'cover'  => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('cover')) {
            if ($book->cover && \Storage::exists('public/' . $book->cover)) {
                \Storage::delete('public/' . $book->cover);
            }
            $data['cover'] = $request->file('cover')->store('covers', 'public');
        }

        $book->update($data);

        return new BookResource($book);
    }

    public function destroy(Book $book)
    {
        $book->delete();
        return response()->json(['message' => 'Book deleted']);
    }
}
