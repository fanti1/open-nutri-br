<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <title>Relatório de Atendimento</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #1a1a1a; }
        h1 { font-size: 18px; margin-bottom: 0; }
        .muted { color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { border-bottom: 1px solid #ddd; padding: 6px 8px; text-align: left; }
        th { background: #f5f5f5; }
    </style>
</head>
<body>
    <h1>OpenNutri BR — Relatório de Atendimento</h1>
    <p class="muted">Paciente: {{ $session->patient->name }} &middot; Sessão: {{ $session->label ?? '—' }} &middot; Data: {{ $session->occurred_at->format('d/m/Y H:i') }}</p>

    <table>
        <thead>
            <tr>
                <th>Calculadora</th>
                <th>Resultado</th>
                <th>Classificação</th>
                <th>Versão da fórmula</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($session->calculationResults as $result)
                <tr>
                    <td>{{ $result->calculator_slug }}</td>
                    <td>
                        @foreach ($result->outputs['values'] as $key => $value)
                            {{ $key }}: {{ $value }}<br>
                        @endforeach
                    </td>
                    <td>{{ $result->outputs['classification'] ?? '—' }}</td>
                    <td>{{ $result->formula_version }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
