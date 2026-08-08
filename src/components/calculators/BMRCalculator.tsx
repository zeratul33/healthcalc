import { useState } from 'react';
import { makeTranslator } from '@/i18n/utils';

interface Props {
  dict: Record<string, unknown>;
}

type Gender = 'male' | 'female';

interface FormState {
  gender: Gender;
  age: string;
  weight: string;
  height: string;
}

interface Errors {
  age?: string;
  weight?: string;
  height?: string;
}

function calcBMR(gender: Gender, age: number, weightKg: number, heightCm: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === 'male' ? base + 5 : base - 161;
}

export default function BMRCalculator({ dict }: Props) {
  const t = makeTranslator(dict);
  const [form, setForm] = useState<FormState>({ gender: 'male', age: '', weight: '', height: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [result, setResult] = useState<number | null>(null);

  function validate(): boolean {
    const errs: Errors = {};
    const age = parseFloat(form.age);
    const w = parseFloat(form.weight);
    const h = parseFloat(form.height);

    if (!form.age) errs.age = t('errors.required');
    else if (isNaN(age) || age < 1 || age > 120) errs.age = t('errors.age_range');

    if (!form.weight) errs.weight = t('errors.required');
    else if (isNaN(w) || w <= 0) errs.weight = t('errors.positive');
    else if (w < 20 || w > 500) errs.weight = t('errors.weight_range');

    if (!form.height) errs.height = t('errors.required');
    else if (isNaN(h) || h <= 0) errs.height = t('errors.positive');
    else if (h < 50 || h > 300) errs.height = t('errors.height_range');

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function calculate() {
    if (!validate()) return;
    const bmr = calcBMR(
      form.gender,
      parseFloat(form.age),
      parseFloat(form.weight),
      parseFloat(form.height),
    );
    setResult(Math.round(bmr));
  }

  function field(
    key: keyof FormState,
    label: string,
    unit: string,
    placeholder: string,
    errKey: keyof Errors,
  ) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} ({unit})
        </label>
        <input
          type="number"
          min="0"
          value={form[key] as string}
          onChange={(e) => {
            setForm({ ...form, [key]: e.target.value });
            setErrors({ ...errors, [errKey]: undefined });
          }}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder={placeholder}
        />
        {errors[errKey] && <p className="text-red-500 text-sm mt-1">{errors[errKey]}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-2xl shadow-md bg-white p-6 w-full max-w-lg mx-auto">
      {/* Gender */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('bmr.gender')}</label>
        <div className="flex gap-2">
          {(['male', 'female'] as Gender[]).map((g) => (
            <button
              key={g}
              onClick={() => setForm({ ...form, gender: g })}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
                form.gender === g
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
              }`}
            >
              {t(`bmr.${g}`)}
            </button>
          ))}
        </div>
      </div>

      {field('age', t('bmr.age'), t('units.years'), '25', 'age')}
      {field('weight', t('bmr.weight'), t('units.kg'), '70', 'weight')}
      {field('height', t('bmr.height'), t('units.cm'), '175', 'height')}

      <button
        onClick={calculate}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg px-6 py-3 transition-colors"
      >
        {t('bmr.calculate')}
      </button>

      {result !== null && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mt-6">
          <div className="text-sm text-gray-500 mb-1">{t('bmr.your_bmr')}</div>
          <div className="text-5xl font-bold text-green-600 mb-1">{result.toLocaleString()}</div>
          <div className="text-sm text-gray-500">{t('units.kcal')}</div>
          <p className="text-xs text-gray-400 mt-3">{t('bmr.result_desc')}</p>
        </div>
      )}
    </div>
  );
}
