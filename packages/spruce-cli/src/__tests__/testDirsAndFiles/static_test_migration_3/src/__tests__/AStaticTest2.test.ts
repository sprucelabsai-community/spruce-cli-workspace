import { fake } from "@sprucelabs/spruce-test-fixtures";
import {
  test,
  assert,
} from "@sprucelabs/test-utils";
import AbstractWhateverTest from "./AbstractWhateverTest";

@fake.login()
export default class StaticTestFinderTest extends AbstractWhateverTest {
  @test()
  protected static async throwsWithMissing() {}

  @test()
  protected static async yourNextTest() {
    assert.isTrue(false);
  }
}
