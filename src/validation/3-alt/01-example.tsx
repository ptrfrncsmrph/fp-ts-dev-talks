import React from "react"
import {
  Container,
  Email,
  Label,
  PhoneNumber,
  useInput,
} from "src/validation/lib/exports"
import { absurd, pipe } from "fp-ts/lib/function"
import * as Ap from "fp-ts/lib/Apply"
import * as E from "fp-ts/lib/Either"
import * as RR from "fp-ts/lib/ReadonlyRecord"
import * as RNEA from "fp-ts/lib/ReadonlyNonEmptyArray"
import * as Sg from "fp-ts/lib/Semigroup"

type FormState = {
  contact: string
}

type ValidatedFormState = PhoneNumber | Email

type Err = [keyof FormState, string]
type Errs = RNEA.ReadonlyNonEmptyArray<Err>

const validate = (state: FormState): E.Either<Errs, ValidatedFormState> =>
  pipe(
    E.fromPredicate(
      PhoneNumber.is,
      (): Errs => [["contact", "Must provide a valid contact"]],
    )(state.contact),
    E.altW(() =>
      E.fromPredicate(
        Email.is,
        (): Errs => [["contact", "Must provide a valid contact"]],
      )(state.contact),
    ),
  )

export const Form = () => {
  const [contact, setContact] = useInput("")

  const result = validate({ contact })
  const errors = toFinalFormValidationErrors(result)

  return (
    <Container>
      <p>We can provide either a phone number or an email.</p>
      <form>
        <Label error={errors.contact}>
          Contact
          <input value={contact} onChange={setContact} />
          <span role="img" className="icon">
            {pipe(
              result,
              E.fold(
                () => "",
                r => (PhoneNumber.is(r) ? "☎️" : "📭"),
              ),
            )}
          </span>
        </Label>
      </form>
      <div>
        <pre>{JSON.stringify(errors, null, 2)}</pre>
      </div>
    </Container>
  )
}

type FinalFormValidationErrors = Partial<{ [K in keyof FormState]: string }>

const toFinalFormValidationErrors: (
  result: E.Either<Errs, ValidatedFormState>,
) => FinalFormValidationErrors = E.fold(
  RR.fromFoldable(Sg.getFirstSemigroup<string>(), RNEA.readonlyNonEmptyArray),
  () => RR.empty,
)
