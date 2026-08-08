import { useState } from 'react';
import { makeTranslator } from '@/i18n/utils';

interface Props {
  dict: Record<string, unknown>;
}

type Unit = 'metric' | 'imperial';

interface FormState {
  unit: Unit;
  weight: string;
  height: string;
  heightFt: string;
  heightIn: string;
}

interface Errors {
  weight?: string;
  height?: string;
}

function getBMICategory(bmi: number, t: (k: string) => string): { label: string; color: string } {
  if (bmi < 18.5) return { label: t('bmi.underweight'), color: 'text-blue-600' };
  if (bmi < 25)   return { label: t('bmi.normal'),      color: 'text-green-600' };
  if (bmi < 30)   return { label: t('bmi.overweight'),  color: 'text-yellow-600' };
  return           { label: t('bmi.obese'),             color: 'text-red-600' };
}

function getBMIBarPercent(bmi: number): number {
  // Map BMI 10–45 → 0–100%
  return Math.min(100, Math.max(0, ((bmi - 10) / 35) * 100));
}

export default function BMICalculator({ dict }: Props) {
  const t = makeTranslator(dict);
  const [form, setForm] = useState<FormState>({
    unit: 'metric',
    weight: '',
    height: '',
    heightFt: '',
    heightIn: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [result, setResult] = useState<number | null>(null);

  function validate(): boolean {
    const errs: Errors = {};
    const w = parseFloat(form.weight);
    if (!form.weight) {
      errs.weight = t('errors.required');
    } else if (isNaN(w) || w <= 0) {
      errs.weight = t('errors.positive');
    } else if (form.unit === 'metric' && (w < 20 || w > 500)) {
      errs.weight = t('errors.weight_range');
    }

    if (form.unit === 'metric') {
      const h = parseFloat(form.height);
      if (!form.height) {
        errs.height = t('errors.required');
      } else if (isNaN(h) || h <= 0) {
        errs.height = t('errors.positive');
      } else if (h < 50 || h > 300) {
        errs.height = t('errors.height_range');
      }
    } else {
      const ft = parseFloat(form.heightFt);
      const inches = parseFloat(form.heightIn || '0');
      if (!form.heightFt) {
        errs.height = t('errors.required');
      } else if (isNaN(ft) || ft <= 0) {
        errs.height = t('errors.positive');
      } else {
        const totalCm = (ft * 30.48) + (inches * 2.54);
        if (totalCm < 50 || totalCm > 300) {
          errs.height = t('errors.height_range');
        }
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function calculate() {
    if (!validate()) return;
    let weightKg = parseFloat(form.weight);
    let heightM: number;

    if (form.unit === 'imperial') {
      weightKg = weightKg * 0.453592;
      const ft = parseFloat(form.heightFt);
      const inches = parseFloat(form.heightIn || '0');
      heightM = (ft * 30.48 + inches * 2.54) / 100;
    } else {
      heightM = parseFloat(form.height) / 100;
    }

    const bmi = weightKg / (heightM * heightM);
    setResult(Math.round(bmi * 10) / 10);
  }

  const category = result !== null ? getBMICategory(result, t) : null;

  return (
    <div className="rounded-2xl shadow-md bg-white p-6 w-full max-w-lg mx-auto">
      {/* Unit toggle */}
      <div className="flex gap-2 mb-6">
        {(['metric', 'imperial'] as Unit[]).map((u) => (
          <button
            key={u}
            onClick={() => { setForm({ ...form, unit: u, weight: '', height: '', heightFt: '', heightIn: '' }); setResult(null); setErrors({}); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
              form.unit === u
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
            }`}
          >
            {u === 'metric' ? t('bmi.unit_metric') : t('bmi.unit_imperial')}
          </button>
        ))}
      </div>

      {/* Weight */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('bmi.weight')} ({form.unit === 'metric' ? t('units.kg') : t('bmi.lbs')})
        </label>
        <input
          type="number"
          min="0"
          value={form.weight}
          onChange={(e) => { setForm({ ...form, weight: e.target.value }); setErrors({ ...errors, weight: undefined }); }}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder={form.unit === 'metric' ? '70' : '154'}
        />
        {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
      </div>

      {/* Height */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('bmi.height')} ({form.unit === 'metric' ? t('units.cm') : `${t('bmi.ft')} / ${t('bmi.in')}`})
        </label>
        {form.unit === 'metric' ? (
          <input
            type="number"
            min="0"
            value={form.height}
            onChange={(e) => { setForm({ ...form, height: e.target.value }); setErrors({ ...errors, height: undefined }); }}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="175"
          />
        ) : (
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              value={form.heightFt}
              onChange={(e) => { setForm({ ...form, heightFt: e.target.value }); setErrors({ ...errors, height: undefined }); }}
              className="w-1/2 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder={`5 ${t('bmi.ft')}`}
            />
            <input
              type="number"
              min="0"
              max="11"
              value={form.heightIn}
              onChange={(e) => setForm({ ...form, heightIn: e.target.value })}
              className="w-1/2 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder={`9 ${t('bmi.in')}`}
            />
          </div>
        )}
        {errors.height && <p className="text-red-500 text-sm mt-1">{errors.height}</p>}
      </div>

      <button
        onClick={calculate}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg px-6 py-3 transition-colors"
      >
        {t('bmi.calculate')}
      </button>

      {/* Result */}
      {result !== null && category && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mt-6">
          <div className="text-sm text-gray-500 mb-1">{t('bmi.your_bmi')}</div>
          <div className={`text-5xl font-bold mb-1 ${category.color}`}>{result}</div>
          <div className={`text-lg font-semibold mb-4 ${category.color}`}>{category.label}</div>
          {/* Color bar */}
          <div className="relative h-3 rounded-full bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-500 mb-1 overflow-visible">
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-gray-700 shadow"
              style={{ left: `${getBMIBarPercent(result)}%`, transform: 'translate(-50%, -50%)' }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>10</span><span>18.5</span><span>25</span><span>30</span><span>45+</span>
          </div>
        </div>
      )}
    </div>
  );
}
