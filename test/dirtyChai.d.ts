/// <reference types="chai" />

declare global {

    export namespace Chai {

        interface Assertion extends LanguageChains, NumericComparison, TypeComparison {
            ok(): Assertion;
            true(): Assertion;
            false(): Assertion;

            // chai-datetime
            equalDate( date:Date ): Assertion;
            equalTime( date:Date ): Assertion;
        }
    }
}

declare function dirtyChai(chai: any, utils: any): void;
declare namespace dirtyChai { }
export = dirtyChai;
