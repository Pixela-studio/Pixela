"use client";

import { useId } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { ReviewEditFormProps } from '@/features/media/types/reviews';
import { REVIEW_MAX_LENGTH } from '@/lib/constants/reviews';
import { StarRatingInput } from '@/shared/components/StarRatingInput';

const STYLES = {
  container: "mt-4 space-y-4",
  label: "block mb-2 text-sm font-medium text-white/70",
  // `focus:outline-none` con sustituto: borde de acento y anillo `focus-visible`.
  textarea: "w-full bg-pixela-surface border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/40 resize-none min-h-[100px] hover:border-white/20 focus:border-pixela-accent/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-pixela-accent/30 transition-[border-color,box-shadow] duration-200 ease-out-expo",
  buttons: {
    container: "flex justify-end gap-2",
    save: "btn btn-primary btn-sm",
    cancel: "btn btn-ghost btn-sm"
  },
  error: "text-sm text-red-400",
} as const;

interface EditFormData {
  text: string;
  rating: number;
}

/**
 * Formulario de edición en línea de una reseña propia.
 * @param {ReviewEditFormProps} props - Propiedades del componente
 */
export const ReviewEditForm = ({
  editText,
  editRating,
  onSave,
  onCancel
}: ReviewEditFormProps) => {
  const ratingLabelId = useId();
  const textareaId = useId();
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
      <div>
        <span id={ratingLabelId} className={STYLES.label}>Puntuación</span>
        <Controller
          name="rating"
          control={control}
          render={({ field: { onChange, value } }) => (
            <StarRatingInput value={value} onChange={onChange} labelledBy={ratingLabelId} />
          )}
        />
      </div>
      <div>
        <label htmlFor={textareaId} className={STYLES.label}>Reseña</label>
        <textarea
          id={textareaId}
          {...register('text', {
            maxLength: {
              value: REVIEW_MAX_LENGTH,
              message: `La reseña no puede superar los ${REVIEW_MAX_LENGTH} caracteres.`,
            },
          })}
          maxLength={REVIEW_MAX_LENGTH}
          aria-invalid={errors.text ? true : undefined}
          aria-describedby={errors.text ? `${textareaId}-error` : undefined}
          className={STYLES.textarea}
          placeholder="¿Qué te pareció?"
        />
        {errors.text && (
          <p id={`${textareaId}-error`} role="alert" className={STYLES.error}>
            {errors.text.message}
          </p>
        )}
      </div>
      <div className={STYLES.buttons.container}>
        <button
          type="button"
          onClick={onCancel}
          className={STYLES.buttons.cancel}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className={STYLES.buttons.save}
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  );
};
