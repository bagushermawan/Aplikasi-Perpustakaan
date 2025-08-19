<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Loan;
use App\Http\Resources\LoanResource;
use Illuminate\Http\Request;

class LoanController extends Controller
{
    /**
     * Tampilkan semua loan
     */
    public function index()
    {
        // Ambil data terbaru
        $loans = Loan::with(['user', 'book'])->latest()->get();
        return LoanResource::collection($loans);
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
