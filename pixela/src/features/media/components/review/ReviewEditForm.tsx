"use client";

import { useForm, Controller } from 'react-hook-form';
import { FiStar } from 'react-icons/fi';
import { ReviewEditFormProps } from '@/features/media/types/reviews';

const STYLES = {
  container: "mt-4 space-y-4",
  stars: {
    container: "flex items-center gap-2",
    button: "text-2xl"
  },
  textarea: "w-full bg-pixela-surface/70 border border-white/10 rounded-lg p-3 text-white resize-none min-h-[100px] focus:outline-none focus:border-pixela-accent/40",
  buttons: {
    container: "flex justify-end gap-2",
    save: "btn btn-primary btn-sm",
    cancel: "btn btn-ghost btn-sm"
  },
  error: "text-sm italic text-pixela-accent",
  ratingValue: "ml-2 text-xs text-yellow-400"
} as const;

interface EditFormData {
  text: string;
  rating: number;
}

/**
 * Componente que muestra la estrella de la reseña
 * @param {boolean} filled - Indica si la estrella está llena
 * @param {boolean} half - Indica si la estrella está media llena
 * @returns {JSX.Element} Componente de estrella de la reseña
 */
const Star = ({ filled, half }: { filled: boolean; half?: boolean }) => (
  <span className="relative inline-block w-6 h-6">
    <FiStar className={`w-6 h-6 absolute top-0 left-0 ${filled ? 'text-yellow-400' : 'text-gray-400'}`} />
    {half && (
      <FiStar
        className="absolute top-0 left-0 w-6 h-6 text-yellow-400"
        style={{ clipPath: 'inset(0 50% 0 0)' }}
      />
    )}
  </span>
);

/**
 * Componente que muestra el formulario de edición de una reseña
 * @param {ReviewEditFormProps} props - Propiedades del componente
 * @returns {JSX.Element} Componente de formulario de edición
 */
export const ReviewEditForm = ({
  editText,
  editRating,
  onSave,
  onCancel
}: ReviewEditFormProps) => {
  const { register, handleSubmit, control, formState: { errors, isSubmitting, isValid } } = useForm<EditFormData>({
    defaultValues: {
      text: editText,
      rating: editRating
    },
    mode: 'onChange'
  });

  const handleSave = (data: EditFormData) => {
    onSave(data.text, data.rating);
  };
  
  return (
    <form onSubmit={handleSubmit(handleSave)} className={STYLES.container}>
      <Controller
        name="rating"
        control={control}
        render={({ field: { onChange, value } }) => (
          <div className={STYLES.stars.container}>
            {[1, 2, 3, 4, 5].map((star) => {
              const starValue = star * 2;
              const isFull = value >= starValue;
              const isHalf = value === starValue - 1;
              return (
                <span key={star} className="relative group">
                  {/* Media estrella (izquierda) */}
                  <button
                    type="button"
                    aria-label={`Puntuar con ${star - 0.5} estrellas`}
                    className="absolute top-0 left-0 z-10 w-1/2 h-full"
                    style={{ cursor: 'pointer' }}
                    onClick={() => onChange(star * 2 - 1)}
                  />
                  {/* Estrella completa (derecha) */}
                  <button
                    type="button"
                    aria-label={`Puntuar con ${star} estrellas`}
                    className="absolute top-0 right-0 z-10 w-1/2 h-full"
                    style={{ cursor: 'pointer' }}
                    onClick={() => onChange(star * 2)}
                  />
                  <Star filled={isFull} half={isHalf} />
                </span>
              );
            })}
            <span className={STYLES.ratingValue}>
              {(value / 2) % 1 === 0 ? (value / 2) : (value / 2).toFixed(1)}/5
            </span>
          </div>
        )}
      />
      <textarea
        {...register('text', {
          maxLength: { value: 600, message: `La reseña no puede superar los 600 caracteres.` }
        })}
        className={STYLES.textarea}
        placeholder="Escribe tu reseña..."
      />
      {errors.text && <p className={STYLES.error}>{errors.text.message}</p>}
      <div className={STYLES.buttons.container}>
        <button
          type="submit"
          className={STYLES.buttons.save}
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={STYLES.buttons.cancel}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};