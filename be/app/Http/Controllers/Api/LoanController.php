<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Loan;
use App\Http\Resources\LoanResource;
use Illuminate\Http\Request;

class LoanController extends Controller
{
    public function index()
    {
        $perPage = request('per_page', 5);
        $search  = request('search');
        $userId  = request('user_id');
        $sortBy  = request('sort_by');
        $sortDir = request('sort_dir', 'asc');

        $query = Loan::with(['user', 'book'])
            ->join('users', 'loans.user_id', '=', 'users.id')
            ->join('books', 'loans.book_id', '=', 'books.id')
            ->select('loans.*');

        // Filter by user
        if ($userId) {
            $query->where('loans.user_id', $userId);
        }

        // Filter search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('users.name', 'like', "%{$search}%")
                    ->orWhere('books.title', 'like', "%{$search}%")
                    ->orWhere('loans.status', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($status = request('status')) {
            $query->where('loans.status', $status);
        }

        // Sorting (whitelist kolom yg boleh)
        $allowedSorts = [
            'users.name',
            'books.title',
            'loans.status',
            'loans.borrowed_at',
            'loans.return_date',
        ];

        if ($sortBy && in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            // default sort (kalau tidak ada sort khusus)
            $query->orderBy('loans.created_at', 'desc');
        }

        return LoanResource::collection(
            $query->paginate($perPage)->appends(request()->all())
        );
    }

    /**
     * Simpan data loan baru
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id'     => 'required|exists:users,id',
            'book_id'     => 'required|exists:books,id',
            'borrowed_at' => 'required|date',
            'return_date' => 'nullable|date|after_or_equal:borrowed_at',
            'status'      => 'required|in:available,borrowed,returned',
        ]);

        $loan = Loan::create($data);

        return new LoanResource($loan->load(['user', 'book']));
    }

    /**
     * Tampilkan detail loan
     */
    public function show(Loan $loan)
    {
        return new LoanResource($loan->load(['user', 'book']));
    }

    /**
     * Update loan
     */
    public function update(Request $request, Loan $loan)
    {
        $data = $request->validate([
            'user_id'     => 'sometimes|exists:users,id',
            'book_id'     => 'sometimes|exists:books,id',
            'borrowed_at' => 'sometimes|date',
            'return_date' => 'nullable|date|after_or_equal:borrowed_at',
            'status'      => 'sometimes|in:available,borrowed,returned',
        ]);

        $loan->update($data);

        return new LoanResource($loan->load(['user', 'book']));
    }

    /**
     * Hapus loan
     */
    public function destroy(Loan $loan)
    {
        $loan->delete();

        return response()->json(['message' => 'Loan deleted successfully']);
    }
}
