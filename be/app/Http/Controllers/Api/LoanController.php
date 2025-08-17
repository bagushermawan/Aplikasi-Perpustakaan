<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Loan;
use Illuminate\Http\Request;

class LoanController extends Controller
{
    public function index()
    {
        return Loan::with(['user', 'book'])->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'book_id' => 'required|exists:books,id',
            'borrowed_at' => 'required|date',
            'due_at' => 'required|date|after:borrowed_at',
        ]);

        $loan = Loan::create($validated);

        return response()->json($loan->load(['user', 'book']), 201);
    }

    public function show(Loan $loan)
    {
        return $loan->load(['user', 'book']);
    }

    public function update(Request $request, Loan $loan)
    {
        $validated = $request->validate([
            'returned_at' => 'nullable|date',
            'status' => 'in:borrowed,returned,late',
        ]);

        $loan->update($validated);

        return response()->json($loan->load(['user', 'book']));
    }

    public function destroy(Loan $loan)
    {
        $loan->delete();
        return response()->json(null, 204);
    }
}
