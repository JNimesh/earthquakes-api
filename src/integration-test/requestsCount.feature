Feature: Request Count Validation

  Scenario: Validate request count for earthquake sync endpoint
    Then I send an API call to get the requests count for path "/api/earthquakes/sync"
    And I am logged into the app
    And I synchronize the app's earthquake data
    Given I wait for 2 seconds
    Then the count for path "/api/earthquakes/sync" should be increased
