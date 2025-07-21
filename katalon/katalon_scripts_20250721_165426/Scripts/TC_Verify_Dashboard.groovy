import static com.kms.katalon.core.checkpoint.CheckpointFactory.findCheckpoint
import static com.kms.katalon.core.testcase.TestCaseFactory.findTestCase
import static com.kms.katalon.core.testdata.TestDataFactory.findTestData
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import static com.kms.katalon.core.testobject.ObjectRepository.findWindowsObject
import com.kms.katalon.core.checkpoint.Checkpoint as Checkpoint
import com.kms.katalon.core.cucumber.keyword.CucumberBuiltinKeywords as CucumberKW
import com.kms.katalon.core.mobile.keyword.MobileBuiltInKeywords as Mobile
import com.kms.katalon.core.model.FailureHandling as FailureHandling
import com.kms.katalon.core.testcase.TestCase as TestCase
import com.kms.katalon.core.testdata.TestData as TestData
import com.kms.katalon.core.testng.keyword.TestNGBuiltinKeywords as TestNGKW
import com.kms.katalon.core.testobject.TestObject as TestObject
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import com.kms.katalon.core.windows.keyword.WindowsBuiltinKeywords as Windows
import internal.GlobalVariable as GlobalVariable
import org.openqa.selenium.Keys as Keys

// Open browser and navigate to the OrangeHRM login page
WebUI.openBrowser('')
WebUI.maximizeWindow()
WebUI.navigateToUrl('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login')

// Wait for page to load
WebUI.waitForElementPresent(findTestObject('Object Repository/Page_Login/input_Username'), 30)

// Login with default admin credentials
WebUI.setText(findTestObject('Object Repository/Page_Login/input_Username'), 'Admin')
WebUI.setText(findTestObject('Object Repository/Page_Login/input_Password'), 'admin123')
WebUI.click(findTestObject('Object Repository/Page_Login/button_Login'))

// Wait for dashboard to load
WebUI.waitForElementPresent(findTestObject('Object Repository/Page_Dashboard/h6_Dashboard'), 30)

// Verify dashboard elements
WebUI.verifyElementPresent(findTestObject('Object Repository/Page_Dashboard/h6_Dashboard'), 10)
WebUI.verifyElementPresent(findTestObject('Object Repository/Page_Dashboard/div_Time_at_Work'), 10)
WebUI.verifyElementPresent(findTestObject('Object Repository/Page_Dashboard/div_My_Actions'), 10)
WebUI.verifyElementPresent(findTestObject('Object Repository/Page_Dashboard/div_Quick_Launch'), 10)
WebUI.verifyElementPresent(findTestObject('Object Repository/Page_Dashboard/div_Buzz_Latest_Posts'), 10)
WebUI.verifyElementPresent(findTestObject('Object Repository/Page_Dashboard/div_Employees_on_Leave_Today'), 10)

// Verify sidebar menu items
WebUI.verifyElementPresent(findTestObject('Object Repository/Page_Dashboard/a_Admin'), 10)
WebUI.verifyElementPresent(findTestObject('Object Repository/Page_Dashboard/a_PIM'), 10)
WebUI.verifyElementPresent(findTestObject('Object Repository/Page_Dashboard/a_Leave'), 10)
WebUI.verifyElementPresent(findTestObject('Object Repository/Page_Dashboard/a_Time'), 10)
WebUI.verifyElementPresent(findTestObject('Object Repository/Page_Dashboard/a_Recruitment'), 10)

// Take screenshot of the dashboard
WebUI.takeScreenshot('Screenshots/dashboard_elements.png')

// Log out
WebUI.click(findTestObject('Object Repository/Page_Dashboard/span_User_Dropdown'))
WebUI.click(findTestObject('Object Repository/Page_Dashboard/a_Logout'))

// Close browser
WebUI.closeBrowser()