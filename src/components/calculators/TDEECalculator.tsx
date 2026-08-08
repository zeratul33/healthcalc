import { useState } from 'react';
import { makeTranslator } from '@/i18n/utils';

interface Props {
  dict: Record<string, unknown>;
}

type Gender = 'male' | 'female';

type ActivityKey = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';

const ACTIVITY_MULTIPLIERS: Record<ActivityKey, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

interface FormState {
  gender: Gender;
  age: string;
  weight: string;
  height: string;
  activity: ActivityKey;
}

interface Errors {
  age?: string;
  weight?: string;
  height?: string;
}

function calcBMR(gender: Gender, age: number, w: number, h: number): number {
  const base = 10 * w + 6.25 * h - 5 * age;
  return gender === 'male' ? base + 5 : base - 161;
}

export default function TDEECalculator({ dict }: Props) {
  const t = makeTranslator(dict);
  const [form, setForm] = useState<FormState>({
    gender: 'male',
    age: '',
    weight: '',
    height: '',
    activity: 'moderately_active',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [result, setResult] = useState<number | null>(null);

  const activityKeys: ActivityKey[] = [
    'sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active',
  ];

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
    const tdee = bmr * ACTIVITY_MULTIPLIERS[form.activity];
    setResult(Math.round(tdee));
  }

  function numField(
    key: 'age' | 'weight' | 'height',
    label: string,
    unit: string,
    placeholder: string,
  ) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} ({unit})
        </label>
        <input
          type="number"
          min="0"
          value={form[key]}
          onChange={(e) => {
            setForm({ ...form, [key]: e.target.value });
            setErrors({ ...errors, [key]: undefined });
          }}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder={placeholder}
        />
        {errors[key] && <p className="text-red-500 text-sm mt-1">{errors[key]}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-2xl shadow-md bg-white p-6 w-full max-w-lg mx-auto">
      {/* Gender */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('tdee.gender')}</label>
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
              {t(`tdee.${g}`)}
            </button>
          ))}
        </div>
      </div>

      {numField('age', t('tdee.age'), t('units.years'), '25')}
      {numField('weight', t('tdee.weight'), t('units.kg'), '70')}
      {numField('height', t('tdee.height'), t('units.cm'), '175')}

      {/* Activity */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('tdee.activity')}</label>
        <select
          value={form.activity}
          onChange={(e) => setForm({ ...form, activity: e.target.value as ActivityKey })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        >
          {activityKeys.map((key) => (
            <option key={key} value={key}>{t(`tdee.${key}`)}</option>
          ))}
        </select>
      </div>

      <button
        onClick={calculate}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg px-6 py-3 transition-colors"
      >
        {t('tdee.calculate')}
      </button>

      {result !== null && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mt-6">
          <div className="text-sm text-gray-500 mb-1">{t('tdee.your_tdee')}</div>
          <div className="text-5xl font-bold text-green-600 mb-1">{result.toLocaleString()}</div>
          <div className="text-sm text-gray-500 mb-4">{t('units.kcal')}</div>

          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-green-200">
                <td className="py-2 text-gray-600">{t('tdee.weight_loss')}</td>
                <td className="py-2 font-semibold text-right text-blue-600">{Math.max(0, result - 500).toLocaleString()} kcal</td>
              </tr>
              <tr className="border-b border-green-200 bg-green-100/50">
                <td className="py-2 text-gray-700 font-medium">{t('tdee.maintenance')}</td>
                <td className="py-2 font-bold text-right text-green-700">{result.toLocaleString()} kcal</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-600">{t('tdee.weight_gain')}</td>
                <td className="py-2 font-semibold text-right text-orange-600">{(result + 500).toLocaleString()} kcal</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
